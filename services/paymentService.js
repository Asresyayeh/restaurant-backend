const Order = require("../models/Order");
const Cart = require("../models/Cart");

class PaymentService {
  /**
   * Initialize real Chapa payment
   */
  async initializeChapaPayment(paymentData, orderData) {
    try {
      console.log("🏦 [CHAPA] Initializing real payment:", {
        amount: paymentData.amount,
        tx_ref: paymentData.tx_ref,
      });

      // Create order with ONLY the fields that exist in your model
      const order = new Order({
        user: orderData.userId,
        restaurant: orderData.restaurantId,
        items: orderData.items.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          // Note: Your model doesn't have 'price' field in items
        })),
        totalPrice: orderData.totalPrice,
        paymentMethod: "chapa",
        status: "pending", // ✅ Use "pending" instead of "pending_payment"
        deliveryAddress: orderData.deliveryAddress,
        // ❌ REMOVE THESE - your model doesn't have them:
        // customerName: orderData.customerName,
        // customerPhone: orderData.customerPhone,
        // paymentStatus: "pending",
        // paymentReference: paymentData.tx_ref,
        // isTest: process.env.NODE_ENV === "development",
      });

      await order.save();
      console.log(`✅ [CHAPA] Order created: ${order._id}`);

      // ... rest of your Chapa API code

      // Prepare Chapa request payload
      // In the chapaPayload section, change the customization:
      const chapaPayload = {
        amount: paymentData.amount.toString(),
        currency: paymentData.currency || "ETB",
        email: paymentData.email,
        first_name: paymentData.first_name,
        last_name: paymentData.last_name,
        phone_number: paymentData.phone_number,
        tx_ref: paymentData.tx_ref,
        callback_url:
          paymentData.callback_url ||
          `${process.env.BASE_URL}/api/payment/webhook`,
        return_url:
          paymentData.return_url ||
          `${process.env.FRONTEND_URL}/order-confirmation`,
        customization: {
          title: "Restaurant Order", // ✅ MAX 16 CHARACTERS
          description: "Food Payment", // Keep description short too
        },
      };

      console.log("🔄 [CHAPA] Sending to Chapa API:", chapaPayload);

      // Make real API call to Chapa
      const chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapaPayload),
        }
      );

      const chapaData = await chapaResponse.json();

      if (!chapaResponse.ok) {
        console.error("❌ [CHAPA] API Error:", chapaData);

        // Better error message extraction
        let errorMessage = "Chapa payment initialization failed";
        if (chapaData.message) {
          if (typeof chapaData.message === "string") {
            errorMessage = chapaData.message;
          } else if (typeof chapaData.message === "object") {
            // Handle object error messages
            errorMessage = JSON.stringify(chapaData.message);
          }
        }

        // Update order status to failed
        await Order.findByIdAndUpdate(order._id, {
          status: "cancelled", // Use "cancelled" instead of "payment_failed"
        });

        throw new Error(errorMessage);
      }

      if (chapaData.status !== "success") {
        throw new Error(chapaData.message || "Payment initialization failed");
      }

      console.log("✅ [CHAPA] Payment initialized successfully");

      return {
        checkout_url: chapaData.data.checkout_url,
        transaction_ref: paymentData.tx_ref,
        orderId: order._id,
        isTest: process.env.NODE_ENV === "development",
      };
    } catch (error) {
      console.error("❌ [CHAPA] Payment service error:", error);
      throw error;
    }
  }

  /**
   * Handle Chapa webhook - for payment confirmation
   */
  async handleChapaWebhook(webhookData, signature) {
    try {
      console.log("📨 [CHAPA] Webhook received:", webhookData);

      // Verify webhook signature for security
      if (process.env.CHAPA_WEBHOOK_SECRET) {
        const crypto = require("crypto");
        const hash = crypto
          .createHmac("sha256", process.env.CHAPA_WEBHOOK_SECRET)
          .update(JSON.stringify(webhookData))
          .digest("hex");

        if (hash !== signature) {
          throw new Error("Invalid webhook signature");
        }
      }

      const { tx_ref, status, data } = webhookData;

      // Find order by payment reference
      const order = await Order.findOne({ paymentReference: tx_ref });

      if (!order) {
        throw new Error(`Order not found for reference: ${tx_ref}`);
      }

      if (status === "success" && data?.status === "success") {
        // Payment successful
        order.paymentStatus = "completed";
        order.status = "confirmed"; // ✅ This is fine
        order.paidAt = new Date();
        order.chapaTransactionId = data.id;

        await order.save();

        // Clear user's cart after successful payment
        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [] } }
        );

        console.log(`✅ [CHAPA] Payment confirmed for order ${order._id}`);
        return {
          success: true,
          order,
          message: "Payment completed successfully",
        };
      } else {
        // Payment failed
        order.paymentStatus = "failed";
        order.status = "cancelled";
        await order.save();

        console.log(`❌ [CHAPA] Payment failed for order ${order._id}`);
        return {
          success: false,
          order,
          message: "Payment failed",
        };
      }
    } catch (error) {
      console.error("❌ [CHAPA] Webhook processing error:", error);
      throw error;
    }
  }

  /**
   * Verify payment status with Chapa
   */
  async verifyPayment(reference) {
    try {
      console.log(`🔍 [CHAPA] Verifying payment: ${reference}`);

      const verifyResponse = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      if (
        verifyData.status === "success" &&
        verifyData.data.status === "success"
      ) {
        const order = await Order.findOne({ paymentReference: reference });
        if (order && order.paymentStatus !== "completed") {
          order.paymentStatus = "completed";
          order.status = "confirmed";
          order.paidAt = new Date();
          order.chapaTransactionId = verifyData.data.id;
          await order.save();

          await Cart.findOneAndUpdate(
            { user: order.user },
            { $set: { items: [] } }
          );
        }
      }

      return verifyData;
    } catch (error) {
      console.error("❌ [CHAPA] Verification error:", error);
      throw error;
    }
  }

  async getPaymentStatus(reference) {
    try {
      const order = await Order.findOne({
        paymentReference: reference,
      }).populate("user restaurant items.menuItem");

      if (!order) {
        throw new Error("Payment not found");
      }

      return {
        payment_reference: order.paymentReference,
        status: order.paymentStatus,
        order_status: order.status,
        amount: order.totalPrice,
        paid_at: order.paidAt,
        transaction_id: order.chapaTransactionId,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
        },
        isTest: order.isTest,
      };
    } catch (error) {
      console.error("❌ [CHAPA] Get status error:", error);
      throw error;
    }
  }

  getPaymentMethods() {
    return [
      {
        id: "telebirr",
        name: "Telebirr",
        icon: "📱",
        description: "Pay with Telebirr Mobile Money",
        supported: true,
      },
      {
        id: "cbebirr",
        name: "CBE Birr",
        icon: "💙",
        description: "Pay with CBE Birr",
        supported: true,
      },
      {
        id: "bank",
        name: "Bank Transfer",
        icon: "🏦",
        description: "Pay with any Ethiopian bank",
        supported: true,
      },
      {
        id: "card",
        name: "Credit/Debit Card",
        icon: "💳",
        description: "Pay with Visa or MasterCard",
        supported: true,
      },
    ];
  }
}

module.exports = new PaymentService();
