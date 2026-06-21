const Order = require("../models/Order");
const Cart = require("../models/Cart");

class PaymentService {
  async initializeChapaPayment(paymentData, orderData) {
    try {
      console.log("🏦 [CHAPA] Initializing real payment:", {
        amount: paymentData.amount,
        tx_ref: paymentData.tx_ref,
      });

      // ✅ FIXED: Explicitly save tx_ref to your database structure
      // (Using standard Chapa field variations so it supports your mongoose model)
      const order = new Order({
        user: orderData.userId,
        restaurant: orderData.restaurantId,
        items: orderData.items.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
        })),
        totalPrice: orderData.totalPrice,
        paymentMethod: "chapa",
        status: "pending",
        deliveryAddress: orderData.deliveryAddress,
        paymentReference: paymentData.tx_ref, // 👈 Saves reference tracking for webhook matching
        tx_ref: paymentData.tx_ref, // Backup mapping field
        customerName: `${paymentData.first_name} ${paymentData.last_name}`,
        customerPhone: paymentData.phone_number,
      });

      await order.save();
      console.log(
        `✅ [CHAPA] Order created dynamically in MongoDB: ${order._id}`,
      );

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
          title: "Restaurant Order",
          description: "Food Payment",
        },
      };

      console.log(
        "🔄 [CHAPA] Sending clean body to Chapa Gateway API:",
        chapaPayload,
      );

      const chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapaPayload),
        },
      );

      const chapaData = await chapaResponse.json();

      if (!chapaResponse.ok) {
        console.error("❌ [CHAPA] API Registration Denied:", chapaData);

        let errorMessage = "Chapa payment initialization failed";
        if (chapaData.message) {
          if (typeof chapaData.message === "string") {
            errorMessage = chapaData.message;
          } else if (typeof chapaData.message === "object") {
            errorMessage = JSON.stringify(chapaData.message);
          }
        }

        await Order.findByIdAndUpdate(order._id, {
          status: "cancelled",
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

  async handleChapaWebhook(webhookData, signature) {
    try {
      console.log(
        "📨 [CHAPA] Webhook signature processing received:",
        webhookData,
      );

      if (process.env.CHAPA_WEBHOOK_SECRET) {
        const crypto = require("crypto");
        const hash = crypto
          .createHmac("sha256", process.env.CHAPA_WEBHOOK_SECRET)
          .update(JSON.stringify(webhookData))
          .digest("hex");

        if (hash !== signature) {
          throw new Error(
            "Invalid webhook signature verification chain failed",
          );
        }
      }

      const { tx_ref, status, data } = webhookData;

      // ✅ FIXED: Fallback search filters added so it matches whichever field string name variant your schema is using
      const order = await Order.findOne({
        $or: [{ paymentReference: tx_ref }, { tx_ref: tx_ref }],
      });

      if (!order) {
        throw new Error(
          `Order document matching code reference not found: ${tx_ref}`,
        );
      }

      if (status === "success" || data?.status === "success") {
        order.paymentStatus = "completed";
        order.status = "confirmed";
        order.paidAt = new Date();
        order.chapaTransactionId = data?.id || webhookData.id;

        await order.save();

        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [] } },
        );

        console.log(
          `✅ [CHAPA] Payment confirmed cleanly. Cart wiped for order: ${order._id}`,
        );
        return {
          success: true,
          order,
          message: "Payment completed successfully",
        };
      } else {
        order.paymentStatus = "failed";
        order.status = "cancelled";
        await order.save();

        console.log(
          `❌ [CHAPA] Payment marked failed inside system for order: ${order._id}`,
        );
        return {
          success: false,
          order,
          message: "Payment failed",
        };
      }
    } catch (error) {
      console.error("❌ [CHAPA] Webhook processing exception catch:", error);
      throw error;
    }
  }

  async verifyPayment(reference) {
    try {
      console.log(
        `🔍 [CHAPA] Executing verification runtime for: ${reference}`,
      );

      const verifyResponse = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        },
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      if (
        verifyData.status === "success" &&
        verifyData.data.status === "success"
      ) {
        const order = await Order.findOne({
          $or: [{ paymentReference: reference }, { tx_ref: reference }],
        });

        if (order && order.paymentStatus !== "completed") {
          order.paymentStatus = "completed";
          order.status = "confirmed";
          order.paidAt = new Date();
          order.chapaTransactionId = verifyData.data.id;
          await order.save();

          await Cart.findOneAndUpdate(
            { user: order.user },
            { $set: { items: [] } },
          );
        }
      }

      return verifyData;
    } catch (error) {
      console.error("❌ [CHAPA] Verification process execution error:", error);
      throw error;
    }
  }

  async getPaymentStatus(reference) {
    try {
      const order = await Order.findOne({
        $or: [{ paymentReference: reference }, { tx_ref: reference }],
      }).populate("user restaurant items.menuItem");

      if (!order) {
        throw new Error(
          "Target payment record lookup query returned empty state",
        );
      }

      return {
        payment_reference: order.paymentReference || order.tx_ref,
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
      console.error(
        "❌ [CHAPA] Get payment records database status extraction error:",
        error,
      );
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
