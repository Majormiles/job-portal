import * as paymentService from '../services/paymentService.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Initialize payment for user
// @route   POST /api/payment/initialize
// @access  Public
export const initializePayment = asyncHandler(async (req, res, next) => {
  const { email, roleName, reference } = req.body;

  console.log('Payment initialization request:', { email, roleName, reference });

  if (!email || !roleName) {
    return next(new AppError('Email and role are required', 400));
  }

  try {
    // Find user to verify they exist and haven't paid already
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for payment:', email);
      return next(new AppError('User not found. Please register first.', 404));
    }

    // Check if user has already paid
    if (user.payment && user.payment.isPaid) {
      console.log('User has already paid:', email);
      return res.status(200).json({
        success: true,
        message: 'User has already paid',
        data: {
          isPaid: true,
          amount: user.payment.amount,
          currency: user.payment.currency,
          date: user.payment.date
        }
      });
    }

    // Initialize transaction
    const paymentData = await paymentService.initializeTransaction(email, roleName, reference);
    console.log('Payment initialized successfully:', paymentData.message);

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: paymentData
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    return next(
      new AppError(error.message || 'Failed to initialize payment', error.statusCode || 500)
    );
  }
});

// @desc    Verify payment
// @route   GET /api/payment/verify/:reference
// @access  Public
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { reference } = req.params;

  console.log('Payment verification request for reference:', reference);

  if (!reference) {
    return next(new AppError('Reference is required', 400));
  }

  try {
    // Verify transaction
    const verificationData = await paymentService.verifyTransaction(reference);
    console.log('Payment verification result:', {
      status: verificationData.data.status,
      reference: verificationData.data.reference
    });

    // If payment was successful, update user payment status
    if (verificationData.data.status === 'success') {
      const email = verificationData.data.customer.email;
      const updatedUser = await paymentService.updateUserPaymentStatus(
        email,
        reference,
        'success',
        verificationData.data
      );
      console.log('User payment status updated:', {
        email,
        isPaid: updatedUser.payment.isPaid
      });
      
      // Log transaction for audit
      await paymentService.logPaymentTransaction(verificationData.data);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verification successful',
      data: {
        reference: verificationData.data.reference,
        status: verificationData.data.status,
        amount: verificationData.data.amount / 100, // Convert from kobo to cedis
        currency: verificationData.data.currency,
        email: verificationData.data.customer.email
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return next(
      new AppError(error.message || 'Failed to verify payment', error.statusCode || 500)
    );
  }
});

// @desc    Check payment status
// @route   GET /api/payment/status/:email
// @access  Public
export const checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const { email } = req.params;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        isPaid: user.payment?.isPaid || false,
        reference: user.payment?.reference || null,
        amount: user.payment?.amount || null,
        currency: user.payment?.currency || 'GHS',
        date: user.payment?.date || null
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return next(
      new AppError(error.message || 'Failed to check payment status', 500)
    );
  }
});

// @desc    Get payment amount by role
// @route   GET /api/payment/amount/:roleName
// @access  Public
export const getPaymentAmount = asyncHandler(async (req, res, next) => {
  const { roleName } = req.params;

  if (!roleName) {
    return next(new AppError('Role name is required', 400));
  }

  try {
    const amount = paymentService.getPaymentAmountByRole(roleName);
    
    res.status(200).json({
      success: true,
      data: {
        amount,
        currency: 'GHS',
        roleName
      }
    });
  } catch (error) {
    console.error('Error getting payment amount:', error);
    return next(
      new AppError(error.message || 'Failed to get payment amount', error.statusCode || 500)
    );
  }
});

// @desc    Handle Paystack webhook
// @route   POST /api/payment/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res, next) => {
  try {
    // Validate webhook signature
    const signature = req.headers['x-paystack-signature'];
    
    if (!signature) {
      console.error('Missing Paystack signature');
      return res.sendStatus(400);
    }

    // Get raw request body as string
    const rawBody = JSON.stringify(req.body);
    const isValid = paymentService.validateWebhookSignature(signature, rawBody);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.sendStatus(401);
    }

    // Process based on event type
    const event = req.body;
    switch (event.event) {
      case 'charge.success':
        const data = event.data;
        const email = data.customer.email;
        
        // Update user payment status
        await paymentService.updateUserPaymentStatus(
          email,
          data.reference,
          'success',
          data
        );
        
        // Log transaction for audit
        await paymentService.logPaymentTransaction(data);
        break;
        
      // Handle other events as needed
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    // Always respond with 200 to Paystack
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to avoid Paystack retrying
    res.sendStatus(200);
  }
});

// @desc    Update user payment status directly
// @route   POST /api/payment/update-status
// @access  Public
export const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { email, reference, amount, currency } = req.body;

  console.log('Manual payment status update request:', { email, reference, amount, currency });

  if (!email || !reference || !amount) {
    return next(new AppError('Email, reference, and amount are required', 400));
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for payment status update:', email);
      return next(new AppError('User not found', 404));
    }

    // Update payment information
    user.payment = {
      isPaid: true,
      reference,
      amount: parseFloat(amount),
      currency: currency || 'GHS',
      date: new Date(),
      gateway: 'paystack'
    };

    await user.save();
    console.log('User payment status manually updated:', {
      email,
      isPaid: user.payment.isPaid,
      amount: user.payment.amount
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        payment: user.payment
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return next(
      new AppError(error.message || 'Failed to update payment status', 500)
    );
  }
});

// @desc    Get payment statistics for admin dashboard
// @route   GET /api/payment/admin/stats
// @access  Admin
export const getAdminPaymentStats = asyncHandler(async (req, res, next) => {
  try {
    const { timeFilter = 'monthly' } = req.query;
    
    // Get all users with payment information
    const users = await User.find({
      'payment.isPaid': true
    });
    
    // Calculate stats based on user types
    const stats = {
      jobSeekers: { count: 0, revenue: 0 },
      employers: { count: 0, revenue: 0 },
      trainers: { count: 0, revenue: 0 },
      trainees: { count: 0, revenue: 0 },
      totalRevenue: 0
    };
    
    // Process time filter
    const now = new Date();
    let startDate;
    
    switch (timeFilter) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1)); // Default to monthly
    }
    
    // Filter and calculate stats
    const filteredUsers = users.filter(user => 
      user.payment && 
      user.payment.date && 
      new Date(user.payment.date) >= startDate
    );
    
    filteredUsers.forEach(user => {
      if (!user.roleName || !user.payment || !user.payment.amount) return;
      
      // Increment counts and revenue
      switch (user.roleName) {
        case 'jobSeeker':
          stats.jobSeekers.count++;
          stats.jobSeekers.revenue += user.payment.amount;
          break;
        case 'employer':
          stats.employers.count++;
          stats.employers.revenue += user.payment.amount;
          break;
        case 'trainer':
          stats.trainers.count++;
          stats.trainers.revenue += user.payment.amount;
          break;
        case 'trainee':
          stats.trainees.count++;
          stats.trainees.revenue += user.payment.amount;
          break;
      }
      
      // Add to total revenue
      stats.totalRevenue += user.payment.amount;
    });
    
    // Round revenue values
    stats.jobSeekers.revenue = Math.round(stats.jobSeekers.revenue);
    stats.employers.revenue = Math.round(stats.employers.revenue);
    stats.trainers.revenue = Math.round(stats.trainers.revenue);
    stats.trainees.revenue = Math.round(stats.trainees.revenue);
    stats.totalRevenue = Math.round(stats.totalRevenue);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting admin payment stats:', error);
    return next(
      new AppError(error.message || 'Failed to get payment statistics', 500)
    );
  }
});

// @desc    Get all transactions for admin
// @route   GET /api/payment/admin/transactions
// @access  Admin
export const getAdminTransactions = asyncHandler(async (req, res, next) => {
  try {
    const { 
      dateRange = 'all', 
      paymentStatus = 'all', 
      userType = 'all',
      page = 1,
      limit = 10
    } = req.query;
    
    // Prepare filter criteria
    const filter = { 'payment.isPaid': true };
    
    // Apply date filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filter['payment.date'] = { $gte: startDate };
      }
    }
    
    // Apply status filter
    if (paymentStatus !== 'all') {
      switch (paymentStatus) {
        case 'successful':
          filter['payment.isPaid'] = true;
          break;
        case 'failed':
          // This would need additional data structure to identify failed payments
          break;
        case 'pending':
          // This would need additional data structure to identify pending payments
          break;
      }
    }
    
    // Apply user type filter
    if (userType !== 'all') {
      filter.roleName = userType;
    }
    
    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);
    
    // Get users with payment data
    const users = await User.find(filter)
      .select('name email payment roleName')
      .sort({ 'payment.date': -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Format transaction data
    const transactions = users.map(user => ({
      id: `TRX-${user.payment.reference}`.substring(0, 15),
      userId: user._id,
      userName: user.name,
      userType: user.roleName,
      amount: user.payment.amount,
      date: user.payment.date,
      status: user.payment.isPaid ? 'successful' : 'failed',
      paymentMethod: user.payment.gateway || 'Card',
      reference: user.payment.reference,
      email: user.email
    }));
    
    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin transactions:', error);
    return next(
      new AppError(error.message || 'Failed to get transactions', 500)
    );
  }
});

// @desc    Get payment analytics data for admin
// @route   GET /api/payment/admin/analytics
// @access  Admin
export const getAdminPaymentAnalytics = asyncHandler(async (req, res, next) => {
  try {
    const { timeRange = 'monthly' } = req.query;
    
    // Get all users with payment information
    const paidUsers = await User.find({
      'payment.isPaid': true
    }).select('payment roleName');
    
    // Prepare analytics data
    const analyticsData = {
      summary: {
        totalRevenue: 0,
        previousPeriodRevenue: 0,
        percentageChange: 0,
        averageTransaction: 0,
        successRate: 0,
        topUserType: ''
      },
      trends: [],
      distribution: [],
      userGrowth: []
    };
    
    // Calculate basic summary data
    if (paidUsers.length > 0) {
      // Calculate total revenue
      analyticsData.summary.totalRevenue = paidUsers.reduce(
        (sum, user) => sum + (user.payment?.amount || 0), 0
      );
      
      // Calculate average transaction value
      analyticsData.summary.averageTransaction = 
        analyticsData.summary.totalRevenue / paidUsers.length;
      
      // Find top user type by revenue
      const revenueByType = {
        jobSeeker: 0,
        employer: 0,
        trainer: 0,
        trainee: 0
      };
      
      paidUsers.forEach(user => {
        if (user.roleName && user.payment?.amount) {
          revenueByType[user.roleName] = 
            (revenueByType[user.roleName] || 0) + user.payment.amount;
        }
      });
      
      const topType = Object.entries(revenueByType)
        .sort((a, b) => b[1] - a[1])[0];
      
      analyticsData.summary.topUserType = topType?.[0] === 'jobSeeker' 
        ? 'Job Seekers' 
        : topType?.[0] === 'employer'
          ? 'Employers'
          : topType?.[0] === 'trainer'
            ? 'Trainers'
            : 'Trainees';
      
      // Calculate payment distribution
      analyticsData.distribution = [
        { name: 'Job Seekers', value: revenueByType.jobSeeker || 0, color: '#3b82f6' },
        { name: 'Employers', value: revenueByType.employer || 0, color: '#10b981' },
        { name: 'Trainers', value: revenueByType.trainer || 0, color: '#f59e0b' },
        { name: 'Trainees', value: revenueByType.trainee || 0, color: '#6366f1' }
      ];
      
      // Calculate trends based on time range
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendsMap = new Map();
      
      if (timeRange === 'monthly') {
        // Initialize all months
        for (let i = 0; i < 12; i++) {
          trendsMap.set(months[i], 0);
        }
        
        // Sum revenue by month
        paidUsers.forEach(user => {
          if (user.payment?.date && user.payment?.amount) {
            const date = new Date(user.payment.date);
            const monthName = months[date.getMonth()];
            trendsMap.set(monthName, trendsMap.get(monthName) + user.payment.amount);
          }
        });
        
        // Convert map to array
        analyticsData.trends = Array.from(trendsMap).map(([month, revenue]) => ({
          month,
          revenue: Math.round(revenue)
        }));
      } else if (timeRange === 'daily') {
        // Daily trends for the last 14 days
        for (let i = 0; i < 14; i++) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          trendsMap.set(day.getDate().toString(), 0);
        }
        
        // Sum revenue by day
        paidUsers.forEach(user => {
          if (user.payment?.date && user.payment?.amount) {
            const date = new Date(user.payment.date);
            // Only include last 14 days
            if ((now - date) <= 14 * 24 * 60 * 60 * 1000) {
              const day = date.getDate().toString();
              if (trendsMap.has(day)) {
                trendsMap.set(day, trendsMap.get(day) + user.payment.amount);
              }
            }
          }
        });
        
        // Convert map to array and sort by day
        analyticsData.trends = Array.from(trendsMap)
          .map(([day, revenue]) => ({
            day,
            revenue: Math.round(revenue)
          }))
          .sort((a, b) => parseInt(a.day) - parseInt(b.day));
      }
      
      // Round averages and percentages
      analyticsData.summary.averageTransaction = 
        Math.round(analyticsData.summary.averageTransaction * 100) / 100;
      
      // Assume 92% success rate since we don't have failed transactions data yet
      analyticsData.summary.successRate = 92;
    }
    
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error getting admin payment analytics:', error);
    return next(
      new AppError(error.message || 'Failed to get payment analytics', 500)
    );
  }
});

// @desc    Generate payment reports for admin
// @route   GET /api/payment/admin/reports
// @access  Admin
export const getAdminPaymentReports = asyncHandler(async (req, res, next) => {
  try {
    const { 
      reportType = 'summary',
      dateRange = 'monthly',
      metrics = [],
      userCategories = []
    } = req.query;
    
    // Parse array params that come as strings
    const selectedMetrics = typeof metrics === 'string' ? [metrics] : metrics;
    const selectedCategories = typeof userCategories === 'string' ? [userCategories] : userCategories;
    
    // Get time range
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'custom':
        // Handle custom date range
        const { startDate: customStart, endDate: customEnd } = req.query;
        startDate = customStart ? new Date(customStart) : new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Get users with payment within date range
    const filter = {
      'payment.isPaid': true,
      'payment.date': { $gte: startDate }
    };
    
    // Apply user category filters if specified
    if (selectedCategories && selectedCategories.length > 0) {
      filter.roleName = { $in: selectedCategories };
    }
    
    const users = await User.find(filter)
      .select('name email payment roleName');
    
    // Generate report data based on type
    let reportData = {};
    
    if (reportType === 'summary') {
      // Basic summary report
      const totalRevenue = users.reduce((sum, user) => sum + (user.payment?.amount || 0), 0);
      const userCounts = {
        jobSeeker: users.filter(u => u.roleName === 'jobSeeker').length,
        employer: users.filter(u => u.roleName === 'employer').length,
        trainer: users.filter(u => u.roleName === 'trainer').length,
        trainee: users.filter(u => u.roleName === 'trainee').length
      };
      
      reportData = {
        totalRevenue,
        userCounts,
        averageRevenue: users.length ? (totalRevenue / users.length) : 0,
        transactionCount: users.length,
        dateRange: {
          from: startDate,
          to: new Date()
        }
      };
    } else if (reportType === 'detailed') {
      // Detailed report with more metrics
      const paymentMethods = {};
      
      users.forEach(user => {
        const method = user.payment?.gateway || 'Unknown';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });
      
      // Calculate revenue by day
      const revenueByDay = {};
      users.forEach(user => {
        if (user.payment?.date) {
          const date = new Date(user.payment.date).toISOString().split('T')[0];
          revenueByDay[date] = (revenueByDay[date] || 0) + (user.payment?.amount || 0);
        }
      });
      
      reportData = {
        transactions: users.map(u => ({
          userName: u.name,
          email: u.email,
          amount: u.payment?.amount || 0,
          date: u.payment?.date,
          paymentMethod: u.payment?.gateway || 'Unknown',
          userType: u.roleName
        })),
        paymentMethods,
        revenueByDay
      };
    } else if (reportType === 'custom') {
      // Custom report with selected metrics
      reportData = { metrics: {} };
      
      if (!selectedMetrics.length) {
        // Default metrics if none selected
        selectedMetrics.push('totalRevenue', 'transactionCount', 'userCounts');
      }
      
      // Calculate requested metrics
      if (selectedMetrics.includes('totalRevenue')) {
        reportData.metrics.totalRevenue = users.reduce(
          (sum, user) => sum + (user.payment?.amount || 0), 0
        );
      }
      
      if (selectedMetrics.includes('transactionCount')) {
        reportData.metrics.transactionCount = users.length;
      }
      
      if (selectedMetrics.includes('averageTransaction')) {
        reportData.metrics.averageTransaction = users.length 
          ? (users.reduce((sum, user) => sum + (user.payment?.amount || 0), 0) / users.length)
          : 0;
      }
      
      if (selectedMetrics.includes('userCounts')) {
        reportData.metrics.userCounts = {
          jobSeeker: users.filter(u => u.roleName === 'jobSeeker').length,
          employer: users.filter(u => u.roleName === 'employer').length,
          trainer: users.filter(u => u.roleName === 'trainer').length,
          trainee: users.filter(u => u.roleName === 'trainee').length
        };
      }
      
      if (selectedMetrics.includes('revenueByCategory')) {
        reportData.metrics.revenueByCategory = {
          jobSeeker: users
            .filter(u => u.roleName === 'jobSeeker')
            .reduce((sum, user) => sum + (user.payment?.amount || 0), 0),
          employer: users
            .filter(u => u.roleName === 'employer')
            .reduce((sum, user) => sum + (user.payment?.amount || 0), 0),
          trainer: users
            .filter(u => u.roleName === 'trainer')
            .reduce((sum, user) => sum + (user.payment?.amount || 0), 0),
          trainee: users
            .filter(u => u.roleName === 'trainee')
            .reduce((sum, user) => sum + (user.payment?.amount || 0), 0)
        };
      }
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating admin payment report:', error);
    return next(
      new AppError(error.message || 'Failed to generate payment report', 500)
    );
  }
}); 