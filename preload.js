const { contextBridge, ipcRenderer } = require('electron');

// Expose API to renderer process
contextBridge.exposeInMainWorld('api', {
  // ==================== BOOKING FUNCTIONS ====================
  getBookings: async () => {
    try {
      console.log('🔄 Fetching bookings from main process...');
      const bookings = await ipcRenderer.invoke('get-bookings');
      console.log(`✅ Received ${bookings.length} bookings from main process`);
      
      if (bookings && Array.isArray(bookings)) {
        return { success: true, data: bookings };
      } else {
        console.error('❌ Invalid bookings data received:', bookings);
        return { success: false, error: 'Invalid data received', data: [] };
      }
    } catch (error) {
      console.error('❌ Get bookings error:', error);
      console.error('❌ Error details:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  },

  updateBookingStatus: async (id, status, rejectionReason = null) => {
    try {
      console.log(`🔄 Updating booking status: ${id} to ${status}`);
      const result = await ipcRenderer.invoke('update-booking-status', id, status, rejectionReason);
      console.log('✅ Update booking status result:', result);
      return result;
    } catch (error) {
      console.error('❌ Update booking status error:', error);
      return { success: false, error: error.message };
    }
  },

  markPaymentAsPaid: async (id) => {
    try {
      console.log(`💰 Marking payment as paid for booking: ${id}`);
      const result = await ipcRenderer.invoke('mark-payment-as-paid', id);
      console.log('✅ Mark payment as paid result:', result);
      return result;
    } catch (error) {
      console.error('❌ Mark payment as paid error:', error);
      return { success: false, error: error.message };
    }
  },

  addExtraCharge: async (id, description, amount, newTotal) => {
    try {
      console.log(`💳 Adding extra charge to booking ${id}: ${description} - ₱${amount}`);
      const result = await ipcRenderer.invoke('add-extra-charge', id, description, amount, newTotal);
      console.log('✅ Add extra charge result:', result);
      return result;
    } catch (error) {
      console.error('❌ Add extra charge error:', error);
      return { success: false, error: error.message };
    }
  },

  getBookingById: async (id) => {
    try {
      console.log(`🔍 Getting booking by ID: ${id}`);
      const booking = await ipcRenderer.invoke('get-booking-by-id', id);
      console.log('✅ Get booking by ID result:', booking ? 'Found' : 'Not found');
      return booking;
    } catch (error) {
      console.error('❌ Get booking by ID error:', error);
      return null;
    }
  },

  getBookingStats: async () => {
    try {
      console.log('📊 Getting booking statistics...');
      const stats = await ipcRenderer.invoke('get-booking-stats');
      console.log('✅ Get booking stats result:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Get booking stats error:', error);
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  },

  getDashboardAnalytics: async () => {
    try {
      console.log('📈 Getting dashboard analytics...');
      const result = await ipcRenderer.invoke('get-dashboard-analytics');
      console.log('✅ Get dashboard analytics result:', result.success ? 'Success' : 'Failed');
      return result;
    } catch (error) {
      console.error('❌ Get dashboard analytics error:', error);
      return { success: false, error: error.message };
    }
  },

  setPaymentDeadline: async (bookingId) => {
    try {
      console.log(`⏰ Setting payment deadline for booking: ${bookingId}`);
      const result = await ipcRenderer.invoke('set-payment-deadline', bookingId);
      console.log('✅ Set payment deadline result:', result);
      return result;
    } catch (error) {
      console.error('❌ Set payment deadline error:', error);
      return { success: false, error: error.message };
    }
  },

  checkExpiredBookings: async () => {
    try {
      console.log('🔍 Checking for expired bookings...');
      const result = await ipcRenderer.invoke('check-expired-bookings');
      console.log('✅ Check expired bookings result:', result);
      return result;
    } catch (error) {
      console.error('❌ Check expired bookings error:', error);
      return { success: false, error: error.message };
    }
  },

  sendBookingApprovalEmail: async (bookingData) => {
    try {
      console.log(`📧 Sending booking approval email for: ${bookingData.booking_id}`);
      const result = await ipcRenderer.invoke('send-booking-approval-email', bookingData);
      console.log('✅ Send booking approval email result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send booking approval email error:', error);
      return { success: false, error: error.message };
    }
  },

  sendBookingRejectionEmail: async (bookingData) => {
    try {
      console.log(`📧 Sending rejection email for: ${bookingData.booking_id}`);
      const result = await ipcRenderer.invoke('send-booking-rejection-email', bookingData);
      console.log('✅ Send rejection email result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send rejection email error:', error);
      return { success: false, error: error.message };
    }
  },

  sendPaymentReceivedEmail: async (bookingData) => {
    try {
      console.log(`📧 Sending payment received email for: ${bookingData.booking_id}`);
      const result = await ipcRenderer.invoke('send-payment-received-email', bookingData);
      console.log('✅ Send payment received email result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send payment received email error:', error);
      return { success: false, error: error.message };
    }
  },

  sendBookingCancellationEmail: async (bookingData) => {
    try {
      console.log(`📧 Sending cancellation email for: ${bookingData.booking_id}`);
      const result = await ipcRenderer.invoke('send-booking-cancellation-email', bookingData);
      console.log('✅ Send cancellation email result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send cancellation email error:', error);
      return { success: false, error: error.message };
    }
  },

  getUsersByIds: async (userIds) => {
    try {
      console.log('👥 Getting users by IDs:', userIds);
      const result = await ipcRenderer.invoke('get-users-by-ids', userIds);
      console.log(`✅ Get users by IDs result: Found ${result.data?.length || 0} users`);
      return result;
    } catch (error) {
      console.error('❌ Get users by IDs error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getUserAvatars: async (userIds) => {
    try {
      console.log('🖼️ Getting user avatars for:', userIds);
      const result = await ipcRenderer.invoke('get-user-avatars', userIds);
      console.log(`✅ Get user avatars result: Found ${Object.keys(result.data || {}).length} avatars`);
      return result;
    } catch (error) {
      console.error('❌ Get user avatars error:', error);
      return { success: false, error: error.message, data: {} };
    }
  },

  // ==================== USER MANAGEMENT FUNCTIONS ====================
  getAllUsers: async () => {
    try {
      console.log('👥 Getting all users...');
      const result = await ipcRenderer.invoke('get-all-users');
      console.log(`✅ Get all users result: Found ${result.data?.length || 0} users`);
      return result;
    } catch (error) {
      console.error('❌ Get all users error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      console.log(`🔄 Updating user status: ${userId} to ${status}`);
      const result = await ipcRenderer.invoke('update-user-status', userId, status);
      console.log('✅ Update user status result:', result);
      return result;
    } catch (error) {
      console.error('❌ Update user status error:', error);
      return { success: false, error: error.message };
    }
  },

  getUserStats: async () => {
    try {
      console.log('📊 Getting user statistics...');
      const result = await ipcRenderer.invoke('get-user-stats');
      console.log('✅ Get user stats result:', result);
      return result;
    } catch (error) {
      console.error('❌ Get user stats error:', error);
      return { success: false, error: error.message, data: { active: 0, blocked: 0, inactive: 0, total: 0 } };
    }
  },

  getUserBookingCount: async (userId) => {
    try {
      console.log(`📊 Getting booking count for user: ${userId}`);
      const result = await ipcRenderer.invoke('get-user-booking-count', userId);
      console.log(`✅ Get user booking count result: ${result.count} bookings`);
      return result;
    } catch (error) {
      console.error('❌ Get user booking count error:', error);
      return { success: false, error: error.message, count: 0 };
    }
  },

  // ==================== AUTHENTICATION FUNCTIONS ====================
  checkUserStatus: async (userId) => {
    try {
      console.log(`🔍 Checking user status: ${userId}`);
      const result = await ipcRenderer.invoke('check-user-status', userId);
      console.log('✅ Check user status result:', result);
      return result;
    } catch (error) {
      console.error('❌ Check user status error:', error);
      return { success: false, error: error.message };
    }
  },

  getUserByEmail: async (email) => {
    try {
      console.log(`🔍 Getting user by email: ${email}`);
      const result = await ipcRenderer.invoke('get-user-by-email', email);
      console.log('✅ Get user by email result:', result.success ? 'Found' : 'Not found');
      return result;
    } catch (error) {
      console.error('❌ Get user by email error:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== DATABASE TESTING ====================
  testDBConnection: async () => {
    try {
      console.log('🧪 Testing database connection...');
      const result = await ipcRenderer.invoke('test-db-connection');
      console.log('✅ Test DB connection result:', result);
      return result;
    } catch (error) {
      console.error('❌ Test DB connection error:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== SERVER COMMUNICATION ====================
  sendOTP: async (email) => {
    try {
      console.log(`📧 Sending OTP to: ${email}`);
      const response = await fetch('http://localhost:3000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      console.log('✅ Send OTP result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      return { success: false, message: 'Failed to send OTP. Please check if server is running.' };
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      console.log(`🔍 Verifying OTP for: ${email}`);
      const response = await fetch('http://localhost:3000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      });
      const result = await response.json();
      console.log('✅ Verify OTP result:', result);
      return result;
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      return { success: false, message: 'Failed to verify OTP. Please check if server is running.' };
    }
  },

  sendBookingApprovalToServer: async (bookingData) => {
    try {
      console.log(`📧 Sending booking approval to server for: ${bookingData.booking_id}`);
      const response = await fetch('http://localhost:3000/api/send-booking-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingData })
      });
      const result = await response.json();
      console.log('✅ Send booking approval to server result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send booking approval to server error:', error);
      return { success: false, message: 'Failed to send booking approval email via server.' };
    }
  },

  sendBookingCancellationToServer: async (bookingData) => {
    try {
      console.log(`📧 Sending booking cancellation to server for: ${bookingData.booking_id}`);
      const response = await fetch('http://localhost:3000/api/send-booking-cancellation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingData })
      });
      const result = await response.json();
      console.log('✅ Send booking cancellation to server result:', result);
      return result;
    } catch (error) {
      console.error('❌ Send booking cancellation to server error:', error);
      return { success: false, message: 'Failed to send cancellation email via server.' };
    }
  },

  checkServerHealth: async () => {
    try {
      console.log('🏥 Checking server health...');
      const response = await fetch('http://localhost:3000/api/health');
      const result = await response.json();
      console.log('✅ Server health check result:', result);
      return result;
    } catch (error) {
      console.error('❌ Server health check error:', error);
      return { status: 'error', message: 'Server is not running' };
    }
  }
});

// Platform info
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
  node: process.versions.node,
  chrome: process.versions.chrome
});

// Utility functions
contextBridge.exposeInMainWorld('utils', {
  formatCurrency: (amount) => {
    return '₱' + parseFloat(amount || 0).toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  },
  
  formatTime: (time) => {
    if (!time) return 'N/A';
    
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${minutes} ${ampm}`;
    }
    
    return time;
  },
  
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  },
  
  formatDateTime: (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true 
    });
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  generateId: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
});

// Debug and logging utilities
contextBridge.exposeInMainWorld('debug', {
  log: (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
      console.log(`[${timestamp}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] ${message}`);
    }
  },
  
  error: (message, error = null) => {
    const timestamp = new Date().toLocaleTimeString();
    if (error) {
      console.error(`[${timestamp}] ❌ ${message}`, error);
    } else {
      console.error(`[${timestamp}] ❌ ${message}`);
    }
  },
  
  warn: (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
      console.warn(`[${timestamp}] ⚠️ ${message}`, data);
    } else {
      console.warn(`[${timestamp}] ⚠️ ${message}`);
    }
  },
  
  info: (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
      console.info(`[${timestamp}] ℹ️ ${message}`, data);
    } else {
      console.info(`[${timestamp}] ℹ️ ${message}`);
    }
  },
  
  table: (data, columns = null) => {
    console.table(data, columns);
  }
});

// Package names mapping
contextBridge.exposeInMainWorld('constants', {
  packageNames: {
    'silver': 'Silver Package (Birthday)',
    'gold': 'Gold Package (Birthday)',
    'platinum': 'Platinum Package (Birthday)',
    'diamond': 'Diamond Package (Birthday)',
    'basic_wedding': 'Basic Wedding Package',
    'premium_wedding': 'Premium Wedding Package',
    'silver_debut': 'Silver Debut Package',
    'gold_debut': 'Gold Debut Package',
    'platinum_debut': 'Platinum Debut Package',
    'silver_corporate': 'Silver Corporate Package',
    'gold_corporate': 'Gold Corporate Package',
    'platinum_corporate': 'Platinum Corporate Package'
  },
  
  bookingStatus: {
    'pending': { color: 'yellow', text: 'Pending', icon: 'fa-clock' },
    'approved': { color: 'green', text: 'Approved', icon: 'fa-check-circle' },
    'rejected': { color: 'red', text: 'Rejected', icon: 'fa-times-circle' },
    'cancelled': { color: 'gray', text: 'Cancelled', icon: 'fa-ban' }
  },
  
  paymentStatus: {
    'paid': { color: 'green', text: 'Paid', icon: 'fa-money-bill-wave' },
    'unpaid': { color: 'yellow', text: 'Unpaid', icon: 'fa-exclamation-triangle' }
  },
  
  userStatus: {
    'active': { color: 'green', text: 'Active', icon: 'fa-user-check' },
    'blocked': { color: 'red', text: 'Blocked', icon: 'fa-user-lock' },
    'inactive': { color: 'gray', text: 'Inactive', icon: 'fa-user-slash' }
  }
});

console.log('✅ Preload script loaded successfully');
console.log('📦 Available APIs:');
console.log('   - api.* (Main application functions)');
console.log('   - electronAPI (Platform information)');
console.log('   - utils.* (Utility functions)');
console.log('   - debug.* (Debugging utilities)');
console.log('   - constants.* (Constants and mappings)');