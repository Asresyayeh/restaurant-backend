const paymentService = require('../services/paymentService');

const paymentController = {
  /**
   * Initialize Chapa payment
   */
  initializeChapa: async (req, res) => {
    try {
      const {
        amount,
        currency = 'ETB',
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref,
        callback_url,
        return_url,
        customization,
        order_data
      } = req.body;

      console.log('🔄 [CONTROLLER] Payment initialization request:', {
        amount,
        customer: order_data?.customerName,
        tx_ref
      });

      // Validate required fields
      if (!amount || !email || !phone_number || !tx_ref || !order_data) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment fields: amount, email, phone_number, tx_ref, and order_data are required'
        });
      }

      const result = await paymentService.initializeChapaPayment(
        {
          amount,
          currency,
          email,
          first_name,
          last_name,
          phone_number,
          tx_ref,
          callback_url,
          return_url,
          customization
        },
        order_data
      );

      res.json({
        success: true,
        message: 'Chapa payment initialized successfully',
        data: result
      });

    } catch (error) {
      console.error('❌ [CONTROLLER] Initialize payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Payment initialization failed'
      });
    }
  },

  /**
   * Handle Chapa webhook
   */
  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers['x-chapa-signature'];
      const webhookData = req.body;

      console.log('📨 [CONTROLLER] Webhook received');

      await paymentService.handleChapaWebhook(webhookData, signature);

      res.status(200).json({ 
        success: true,
        message: 'Webhook processed successfully' 
      });

    } catch (error) {
      console.error('❌ [CONTROLLER] Webhook error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message || 'Webhook processing failed' 
      });
    }
  },

  /**
   * Verify payment status
   */
  verifyPayment: async (req, res) => {
    try {
      const { reference } = req.params;

      console.log(`🔍 [CONTROLLER] Verifying payment: ${reference}`);

      const result = await paymentService.verifyPayment(reference);

      res.json({
        success: true,
        message: 'Payment verification completed',
        data: result
      });

    } catch (error) {
      console.error('❌ [CONTROLLER] Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Payment verification failed'
      });
    }
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (req, res) => {
    try {
      const { reference } = req.params;

      const result = await paymentService.getPaymentStatus(reference);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ [CONTROLLER] Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment status'
      });
    }
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: async (req, res) => {
    try {
      const methods = paymentService.getPaymentMethods();

      res.json({
        success: true,
        data: {
          payment_methods: methods,
          provider: 'Chapa',
          test_mode: process.env.NODE_ENV === 'development',
          note: process.env.NODE_ENV === 'development' 
            ? 'Currently in test mode - no real transactions'
            : 'Live payment processing'
        }
      });

    } catch (error) {
      console.error('❌ [CONTROLLER] Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment methods'
      });
    }
  }
};

module.exports = paymentController;