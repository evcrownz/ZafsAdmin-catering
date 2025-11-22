require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');
const axios = require('axios');

// Test if env variables are loaded
console.log('📧 Admin Email:', process.env.SMTP_EMAIL);
console.log('🔑 Brevo API Key loaded:', !!process.env.BREVO_API_KEY);

// Create main window
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    center: true,
    icon: path.join(__dirname, 'logo-desktop', 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Completely remove menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools for debugging (optional - remove in production)
  mainWindow.webContents.openDevTools();
}

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM;
const BREVO_FROM_NAME = process.env.BREVO_NAME;

// Function to send booking approval email
async function sendBookingApprovalEmail(bookingData) {
  try {
    const { email, full_name, booking_id, total_price, event_date } = bookingData;
    
    const brevoData = {
      sender: {
        name: BREVO_FROM_NAME,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: email,
          name: full_name
        }
      ],
      subject: '🎉 Your Booking Has Been Approved! - Zaf\'s Kitchen',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>Booking Approved</title>
        </head>
        <body style='font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;'>
          <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;'>
            <div style='text-align: center; margin-bottom: 30px;'>
              <h1 style='color: #DC2626; margin: 0; font-size: 32px;'>Zaf's Kitchen</h1>
              <p style='color: #666; margin: 5px 0 0 0; font-size: 14px;'>Catering Services</p>
            </div>
            
            <div style='background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border-left: 5px solid #28a745;'>
              <h2 style='color: #155724; margin: 0 0 15px 0; font-size: 28px;'>🎉 Booking Approved!</h2>
              <p style='color: #155724; margin: 0; font-size: 16px;'>Your booking request has been approved!</p>
            </div>
            
            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
              <h3 style='color: #DC2626; margin-top: 0;'>Booking Details</h3>
              <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Booking ID:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>${booking_id}</td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Customer Name:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>${full_name}</td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Event Date:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>${new Date(event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Total Amount:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>₱${parseFloat(total_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                </tr>
              </table>
            </div>

            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #856404; margin-top: 0;'>⏰ Important Payment Deadline</h3>
              <p style='color: #856404; margin: 10px 0;'><strong>You have 20 hours to complete your payment.</strong></p>
              <p style='color: #856404; margin: 10px 0;'>If payment is not received within 20 hours, your booking will be automatically cancelled.</p>
            </div>

            <div style='background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #004085; margin-top: 0;'>💰 Payment Instructions</h3>
              <p style='color: #004085; margin: 15px 0;'><strong>GCash Payment:</strong></p>
              <div style='background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0;'>
                <p style='margin: 5px 0;'><strong>GCash Number:</strong> <span style='color: #DC2626; font-size: 18px;'>0917 123 4567</span></p>
                <p style='margin: 5px 0;'><strong>Account Name:</strong> ZAF'S KITCHEN</p>
                <p style='margin: 5px 0;'><strong>Amount:</strong> ₱${parseFloat(total_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <p style='color: #004085; margin: 10px 0; font-size: 14px;'><strong>Important:</strong> After payment, please save the transaction reference number and send it to us via our Facebook page or contact number for verification.</p>
            </div>

            <div style='background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #0c5460; margin-top: 0;'>📞 Contact Information</h3>
              <p style='color: #0c5460; margin: 8px 0;'><strong>Facebook:</strong> <a href='https://facebook.com/zafskitchen' style='color: #DC2626;'>Zaf's Kitchen Official</a></p>
              <p style='color: #0c5460; margin: 8px 0;'><strong>Phone:</strong> 0917 123 4567</p>
              <p style='color: #0c5460; margin: 8px 0;'><strong>Email:</strong> zafskitchen95@gmail.com</p>
            </div>

            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
              <p style='font-size: 14px; color: #666; margin: 0;'>Thank you for choosing Zaf's Kitchen!</p>
              <p style='font-size: 12px; color: #999; margin: 10px 0 0 0;'>© ${new Date().getFullYear()} Zaf's Kitchen. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      console.log(`✅ Booking approval email sent to ${email}`);
      return { success: true, message: 'Email sent successfully' };
    } else {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Send booking approval email error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Function to send booking rejection email
async function sendBookingRejectionEmail(bookingData) {
  try {
    const { email, full_name, booking_id, rejection_reason } = bookingData;
    
    const brevoData = {
      sender: {
        name: BREVO_FROM_NAME,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: email,
          name: full_name
        }
      ],
      subject: '❌ Booking Request Declined - Zaf\'s Kitchen',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>Booking Declined</title>
        </head>
        <body style='font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;'>
          <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;'>
            <div style='text-align: center; margin-bottom: 30px;'>
              <h1 style='color: #DC2626; margin: 0; font-size: 32px;'>Zaf's Kitchen</h1>
            </div>
            
            <div style='background: #f8d7da; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border-left: 5px solid #dc3545;'>
              <h2 style='color: #721c24; margin: 0 0 15px 0; font-size: 28px;'>❌ Booking Declined</h2>
              <p style='color: #721c24; margin: 0; font-size: 16px;'>We regret to inform you that your booking request has been declined.</p>
            </div>
            
            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
              <h3 style='color: #DC2626; margin-top: 0;'>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking_id}</p>
              <p><strong>Customer Name:</strong> ${full_name}</p>
            </div>

            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #856404; margin-top: 0;'>📝 Reason for Declination</h3>
              <p style='color: #856404; margin: 10px 0;'><strong>${rejection_reason}</strong></p>
            </div>

            <div style='background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #004085; margin-top: 0;'>💡 Need Assistance?</h3>
              <p style='color: #004085; margin: 10px 0;'>If you have questions or would like to discuss alternative options, please feel free to contact us.</p>
              <p style='color: #004085; margin: 8px 0;'><strong>Contact:</strong> 0917 123 4567</p>
              <p style='color: #004085; margin: 8px 0;'><strong>Email:</strong> zafskitchen95@gmail.com</p>
              <p style='color: #004085; margin: 8px 0;'><strong>Facebook:</strong> <a href='https://facebook.com/zafskitchen' style='color: #DC2626;'>Zaf's Kitchen Official</a></p>
            </div>

            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
              <p style='font-size: 14px; color: #666; margin: 0;'>We hope to serve you in the future!</p>
              <p style='font-size: 12px; color: #999; margin: 10px 0 0 0;'>© ${new Date().getFullYear()} Zaf's Kitchen. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      console.log(`✅ Rejection email sent to ${email}`);
      return { success: true, message: 'Rejection email sent successfully' };
    } else {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Send rejection email error:', error);
    return { success: false, error: error.message };
  }
}

// Function to send payment received email
async function sendPaymentReceivedEmail(bookingData) {
  try {
    const { email, full_name, booking_id, total_price, event_date } = bookingData;
    
    const brevoData = {
      sender: {
        name: BREVO_FROM_NAME,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: email,
          name: full_name
        }
      ],
      subject: '✅ Payment Received - Booking Confirmed! - Zaf\'s Kitchen',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>Payment Received</title>
        </head>
        <body style='font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;'>
          <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;'>
            <div style='text-align: center; margin-bottom: 30px;'>
              <h1 style='color: #DC2626; margin: 0; font-size: 32px;'>Zaf's Kitchen</h1>
              <p style='color: #666; margin: 5px 0 0 0; font-size: 14px;'>Catering Services</p>
            </div>
            
            <div style='background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border-left: 5px solid #28a745;'>
              <h2 style='color: #155724; margin: 0 0 15px 0; font-size: 28px;'>✅ Payment Received!</h2>
              <p style='color: #155724; margin: 0; font-size: 16px;'>Your booking is now confirmed!</p>
            </div>
            
            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
              <h3 style='color: #DC2626; margin-top: 0;'>Booking Confirmation</h3>
              <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Booking ID:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>${booking_id}</td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Customer Name:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>${full_name}</td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Event Date:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>${new Date(event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Total Amount Paid:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>₱${parseFloat(total_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                </tr>
                <tr>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Payment Status:</strong></td>
                  <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong style='color: #28a745;'>PAID</strong></td>
                </tr>
              </table>
            </div>

            <div style='background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #004085; margin-top: 0;'>🎉 What's Next?</h3>
              <p style='color: #004085; margin: 10px 0;'><strong>Your event is now officially booked!</strong></p>
              <p style='color: #004085; margin: 10px 0;'>We will contact you 3 days before your event date to confirm final details and discuss any last-minute requirements.</p>
            </div>

            <div style='background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #0c5460; margin-top: 0;'>📞 Contact Information</h3>
              <p style='color: #0c5460; margin: 8px 0;'><strong>Facebook:</strong> <a href='https://facebook.com/zafskitchen' style='color: #DC2626;'>Zaf's Kitchen Official</a></p>
              <p style='color: #0c5460; margin: 8px 0;'><strong>Phone:</strong> 0917 123 4567</p>
              <p style='color: #0c5460; margin: 8px 0;'><strong>Email:</strong> zafskitchen95@gmail.com</p>
            </div>

            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
              <p style='font-size: 14px; color: #666; margin: 0;'>Thank you for choosing Zaf's Kitchen! We look forward to serving you.</p>
              <p style='font-size: 12px; color: #999; margin: 10px 0 0 0;'>© ${new Date().getFullYear()} Zaf's Kitchen. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      console.log(`✅ Payment received email sent to ${email}`);
      return { success: true, message: 'Payment received email sent successfully' };
    } else {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Send payment received email error:', error);
    return { success: false, error: error.message };
  }
}

// Function to send booking cancellation email
async function sendBookingCancellationEmail(bookingData) {
  try {
    const { email, full_name, booking_id } = bookingData;
    
    const brevoData = {
      sender: {
        name: BREVO_FROM_NAME,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: email,
          name: full_name
        }
      ],
      subject: '❌ Booking Cancelled - Zaf\'s Kitchen',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>Booking Cancelled</title>
        </head>
        <body style='font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;'>
          <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;'>
            <div style='text-align: center; margin-bottom: 30px;'>
              <h1 style='color: #DC2626; margin: 0; font-size: 32px;'>Zaf's Kitchen</h1>
            </div>
            
            <div style='background: #f8d7da; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border-left: 5px solid #dc3545;'>
              <h2 style='color: #721c24; margin: 0 0 15px 0; font-size: 28px;'>❌ Booking Cancelled</h2>
              <p style='color: #721c24; margin: 0; font-size: 16px;'>Your booking has been cancelled due to non-payment.</p>
            </div>
            
            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
              <h3 style='color: #DC2626; margin-top: 0;'>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking_id}</p>
              <p><strong>Customer Name:</strong> ${full_name}</p>
              <p><strong>Reason for Cancellation:</strong> Payment was not received within the 20-hour deadline.</p>
            </div>

            <div style='background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 25px 0;'>
              <h3 style='color: #004085; margin-top: 0;'>💡 Need Assistance?</h3>
              <p style='color: #004085; margin: 10px 0;'>If you still wish to proceed with your booking or encountered issues with payment, please contact us immediately.</p>
              <p style='color: #004085; margin: 8px 0;'><strong>Contact:</strong> 0917 123 4567</p>
              <p style='color: #004085; margin: 8px 0;'><strong>Email:</strong> zafskitchen95@gmail.com</p>
            </div>

            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
              <p style='font-size: 14px; color: #666; margin: 0;'>We hope to serve you in the future!</p>
              <p style='font-size: 12px; color: #999; margin: 10px 0 0 0;'>© ${new Date().getFullYear()} Zaf's Kitchen. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      console.log(`✅ Cancellation email sent to ${email}`);
      return { success: true, message: 'Cancellation email sent successfully' };
    } else {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Send cancellation email error:', error);
    return { success: false, error: error.message };
  }
}

// --------------------------------------------------
// DATABASE HANDLERS - BOOKINGS
// --------------------------------------------------

// Get all bookings with user avatars - FIXED VERSION
ipcMain.handle('get-bookings', async () => {
  try {
    console.log('📊 Fetching all bookings with user data...');
    
    // Test database connection first
    try {
      const testResult = await db.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful:', testResult.rows[0].current_time);
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      return [];
    }

    // Try the main query with LEFT JOIN
    let result;
    try {
      result = await db.query(`
        SELECT 
          b.id,
          b.user_id,
          b.full_name,
          b.contact_number,
          b.celebrant_name,
          b.celebrant_age,
          b.guest_count,
          b.food_package,
          b.event_type,
          b.event_date,
          b.start_time,
          b.end_time,
          b.location,
          b.event_theme,
          b.custom_theme,
          b.theme_suggestions,
          b.selected_menus,
          b.total_price,
          b.booking_status,
          b.payment_status,
          b.rejection_reason,
          b.approved_at,
          b.created_at,
          b.updated_at,
          b.payment_deadline,
          u.avatar_url,
          u.email as user_email
        FROM bookings b
        LEFT JOIN usertable u ON b.user_id = u.id
        ORDER BY b.created_at DESC
      `);
    } catch (joinError) {
      console.log('⚠️ LEFT JOIN failed, trying simple query...');
      // Fallback to simple query without JOIN
      result = await db.query(`
        SELECT 
          id,
          user_id,
          full_name,
          contact_number,
          celebrant_name,
          celebrant_age,
          guest_count,
          food_package,
          event_type,
          event_date,
          start_time,
          end_time,
          location,
          event_theme,
          custom_theme,
          theme_suggestions,
          selected_menus,
          total_price,
          booking_status,
          payment_status,
          rejection_reason,
          approved_at,
          created_at,
          updated_at,
          payment_deadline
        FROM bookings 
        ORDER BY created_at DESC
      `);
    }
    
    console.log(`✅ Found ${result.rows.length} bookings`);
    
    // Log sample data for debugging
    if (result.rows.length > 0) {
      console.log('📝 First 3 bookings:');
      result.rows.slice(0, 3).forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.full_name} - ${booking.booking_status} - ${booking.event_type}`);
      });
    } else {
      console.log('ℹ️ No bookings found in database');
    }
    
    return result.rows;
  } catch (err) {
    console.error('❌ DB Error (get-bookings):', err.message);
    console.error('❌ Error stack:', err.stack);
    return [];
  }
});

// Update booking status
ipcMain.handle('update-booking-status', async (event, bookingId, status, rejectionReason) => {
  try {
    console.log(`🔄 Updating booking ${bookingId} to status: ${status}`);
    
    let query;
    let params;

    if (status === 'rejected' && rejectionReason) {
      query = `
        UPDATE bookings 
        SET booking_status = $1, rejection_reason = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      params = [status, rejectionReason, bookingId];
    } else {
      query = `
        UPDATE bookings 
        SET booking_status = $1, rejection_reason = NULL, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      params = [status, bookingId];
    }

    const result = await db.query(query, params);
    
    if (result.rows.length > 0) {
      console.log('✅ Booking updated successfully');
      return { success: true, booking: result.rows[0] };
    } else {
      console.log('❌ Booking not found');
      return { success: false, error: 'Booking not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (update-booking-status):', err);
    return { success: false, error: err.message };
  }
});

// Mark payment as paid
ipcMain.handle('mark-payment-as-paid', async (event, bookingId) => {
  try {
    console.log(`💰 Marking payment as paid for booking: ${bookingId}`);
    
    const result = await db.query(`
      UPDATE bookings 
      SET payment_status = 'paid', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [bookingId]);

    if (result.rows.length > 0) {
      console.log('✅ Payment marked as paid successfully');
      return { success: true, booking: result.rows[0] };
    } else {
      console.log('❌ Booking not found');
      return { success: false, error: 'Booking not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (mark-payment-as-paid):', err);
    return { success: false, error: err.message };
  }
});

// Add extra charge
ipcMain.handle('add-extra-charge', async (event, bookingId, description, amount, newTotal) => {
  try {
    console.log(`💳 Adding extra charge to booking ${bookingId}: ${description} - ₱${amount}`);
    
    const result = await db.query(`
      UPDATE bookings 
      SET total_price = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [newTotal, bookingId]);

    if (result.rows.length > 0) {
      console.log('✅ Extra charge added successfully');
      return { success: true, booking: result.rows[0] };
    } else {
      console.log('❌ Booking not found');
      return { success: false, error: 'Booking not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (add-extra-charge):', err);
    return { success: false, error: err.message };
  }
});

// Get booking by ID with user data
ipcMain.handle('get-booking-by-id', async (event, bookingId) => {
  try {
    console.log(`🔍 Fetching booking with user data: ${bookingId}`);
    const result = await db.query(`
      SELECT 
        b.*,
        u.avatar_url,
        u.email as user_email
      FROM bookings b
      LEFT JOIN usertable u ON b.user_id = u.id
      WHERE b.id = $1
    `, [bookingId]);
    
    if (result.rows.length > 0) {
      console.log('✅ Booking with user data found');
      return result.rows[0];
    } else {
      console.log('❌ Booking not found');
      return null;
    }
  } catch (err) {
    console.error('❌ DB Error (get-booking-by-id):', err);
    return null;
  }
});

// Get bookings statistics
ipcMain.handle('get-booking-stats', async () => {
  try {
    console.log('📊 Fetching booking statistics...');
    const result = await db.query(`
      SELECT 
        booking_status,
        COUNT(*) as count
      FROM bookings
      GROUP BY booking_status
    `);
    
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    result.rows.forEach(row => {
      stats[row.booking_status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    console.log('✅ Stats calculated:', stats);
    return stats;
  } catch (err) {
    console.error('❌ DB Error (get-booking-stats):', err);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
});

// Set payment deadline when booking is approved
ipcMain.handle('set-payment-deadline', async (event, bookingId) => {
  try {
    console.log(`⏰ Setting payment deadline for booking: ${bookingId}`);
    
    const paymentDeadline = new Date(Date.now() + 20 * 60 * 60 * 1000); // 20 hours from now
    
    const result = await db.query(`
      UPDATE bookings 
      SET payment_deadline = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [paymentDeadline, bookingId]);

    if (result.rows.length > 0) {
      console.log('✅ Payment deadline set successfully');
      return { success: true, booking: result.rows[0] };
    } else {
      console.log('❌ Booking not found');
      return { success: false, error: 'Booking not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (set-payment-deadline):', err);
    return { success: false, error: err.message };
  }
});

// Check and cancel expired bookings
ipcMain.handle('check-expired-bookings', async () => {
  try {
    console.log('🔍 Checking for expired bookings...');
    
    const result = await db.query(`
      UPDATE bookings 
      SET booking_status = 'cancelled', 
        updated_at = NOW(),
        cancellation_reason = 'Payment not received within 20-hour deadline'
      WHERE booking_status = 'approved' 
      AND payment_status != 'paid'
      AND payment_deadline IS NOT NULL
      AND payment_deadline < NOW()
      RETURNING id, full_name, user_email
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Cancelled ${result.rows.length} expired bookings`);
      
      // Send cancellation emails
      result.rows.forEach(async (booking) => {
        await sendBookingCancellationEmail({
          email: booking.user_email,
          full_name: booking.full_name,
          booking_id: booking.id
        });
      });
      
      return { success: true, cancelled: result.rows.length, bookings: result.rows };
    } else {
      console.log('✅ No expired bookings found');
      return { success: true, cancelled: 0, bookings: [] };
    }
  } catch (err) {
    console.error('❌ DB Error (check-expired-bookings):', err);
    return { success: false, error: err.message };
  }
});

// Send booking approval email
ipcMain.handle('send-booking-approval-email', async (event, bookingData) => {
  try {
    console.log(`📧 Sending booking approval email for: ${bookingData.booking_id}`);
    const result = await sendBookingApprovalEmail(bookingData);
    return result;
  } catch (err) {
    console.error('❌ Error sending booking approval email:', err);
    return { success: false, error: err.message };
  }
});

// Send booking rejection email
ipcMain.handle('send-booking-rejection-email', async (event, bookingData) => {
  try {
    console.log(`📧 Sending rejection email for: ${bookingData.booking_id}`);
    const result = await sendBookingRejectionEmail(bookingData);
    return result;
  } catch (err) {
    console.error('❌ Error sending rejection email:', err);
    return { success: false, error: err.message };
  }
});

// Send payment received email
ipcMain.handle('send-payment-received-email', async (event, bookingData) => {
  try {
    console.log(`📧 Sending payment received email for: ${bookingData.booking_id}`);
    const result = await sendPaymentReceivedEmail(bookingData);
    return result;
  } catch (err) {
    console.error('❌ Error sending payment received email:', err);
    return { success: false, error: err.message };
  }
});

// Send booking cancellation email
ipcMain.handle('send-booking-cancellation-email', async (event, bookingData) => {
  try {
    console.log(`📧 Sending cancellation email for: ${bookingData.booking_id}`);
    const result = await sendBookingCancellationEmail(bookingData);
    return result;
  } catch (err) {
    console.error('❌ Error sending cancellation email:', err);
    return { success: false, error: err.message };
  }
});

// Get users by IDs for avatars (backup method)
ipcMain.handle('get-users-by-ids', async (event, userIds) => {
  try {
    console.log('👥 Fetching users by IDs:', userIds);
    
    if (!userIds || userIds.length === 0) {
      return { success: true, data: [] };
    }

    const result = await db.query(`
      SELECT id, email, name, avatar_url, created_at 
      FROM usertable 
      WHERE id = ANY($1::uuid[])
    `, [userIds]);

    console.log(`✅ Found ${result.rows.length} users`);
    return { success: true, data: result.rows };
  } catch (err) {
    console.error('❌ DB Error (get-users-by-ids):', err);
    return { success: false, error: err.message, data: [] };
  }
});

// Get user avatars for multiple users (backup method)
ipcMain.handle('get-user-avatars', async (event, userIds) => {
  try {
    console.log('🖼️ Fetching user avatars for:', userIds);
    
    if (!userIds || userIds.length === 0) {
      return { success: true, data: {} };
    }

    const result = await db.query(`
      SELECT id, avatar_url 
      FROM usertable 
      WHERE id = ANY($1::uuid[]) AND avatar_url IS NOT NULL
    `, [userIds]);

    const avatars = {};
    result.rows.forEach(user => {
      avatars[user.id] = user.avatar_url;
    });

    console.log(`✅ Found ${result.rows.length} avatars`);
    return { success: true, data: avatars };
  } catch (err) {
    console.error('❌ DB Error (get-user-avatars):', err);
    return { success: false, error: err.message, data: {} };
  }
});

// --------------------------------------------------
// DATABASE HANDLERS - USER MANAGEMENT
// --------------------------------------------------

// Get all users
ipcMain.handle('get-all-users', async () => {
  try {
    console.log('👥 Fetching all users...');
    const result = await db.query(`
      SELECT 
        id,
        name,
        email,
        status,
        avatar_url,
        created_at,
        updated_at
      FROM usertable
      ORDER BY created_at DESC
    `);
    console.log(`✅ Found ${result.rows.length} users`);
    return { success: true, data: result.rows };
  } catch (err) {
    console.error('❌ DB Error (get-all-users):', err);
    return { success: false, error: err.message, data: [] };
  }
});

// Update user status (block/unblock)
ipcMain.handle('update-user-status', async (event, userId, status) => {
  try {
    console.log(`🔄 Updating user ${userId} status to: ${status}`);
    
    const result = await db.query(`
      UPDATE usertable 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, status, avatar_url, created_at, updated_at
    `, [status, userId]);

    if (result.rows.length > 0) {
      console.log('✅ User status updated successfully');
      return { success: true, user: result.rows[0] };
    } else {
      console.log('❌ User not found');
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (update-user-status):', err);
    return { success: false, error: err.message };
  }
});

// Get user statistics
ipcMain.handle('get-user-stats', async () => {
  try {
    console.log('📊 Fetching user statistics...');
    const result = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM usertable
      GROUP BY status
    `);
    
    const stats = {
      active: 0,
      blocked: 0,
      inactive: 0,
      total: 0
    };

    result.rows.forEach(row => {
      const status = row.status || 'active'; // Default to active if null
      stats[status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    console.log('✅ User stats calculated:', stats);
    return { success: true, data: stats };
  } catch (err) {
    console.error('❌ DB Error (get-user-stats):', err);
    return { success: false, error: err.message, data: { active: 0, blocked: 0, inactive: 0, total: 0 } };
  }
});

// Get user bookings count
ipcMain.handle('get-user-booking-count', async (event, userId) => {
  try {
    console.log(`📊 Fetching booking count for user: ${userId}`);
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE user_id = $1
    `, [userId]);
    
    return { success: true, count: parseInt(result.rows[0]?.count || 0) };
  } catch (err) {
    console.error('❌ DB Error (get-user-booking-count):', err);
    return { success: false, error: err.message, count: 0 };
  }
});

// --------------------------------------------------
// AUTHENTICATION HANDLERS
// --------------------------------------------------

// Check if user is blocked
ipcMain.handle('check-user-status', async (event, userId) => {
  try {
    console.log(`🔍 Checking status for user: ${userId}`);
    const result = await db.query(`
      SELECT status 
      FROM usertable 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length > 0) {
      const status = result.rows[0].status;
      console.log(`✅ User ${userId} status: ${status}`);
      return { success: true, status: status, isBlocked: status === 'blocked' };
    } else {
      console.log('❌ User not found');
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (check-user-status):', err);
    return { success: false, error: err.message };
  }
});

// Get user by email for login validation
ipcMain.handle('get-user-by-email', async (event, email) => {
  try {
    console.log(`🔍 Finding user by email: ${email}`);
    const result = await db.query(`
      SELECT id, name, email, status, avatar_url, password
      FROM usertable 
      WHERE email = $1
    `, [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`✅ User found: ${user.name} (Status: ${user.status})`);
      return { success: true, user: user };
    } else {
      console.log('❌ User not found');
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('❌ DB Error (get-user-by-email):', err);
    return { success: false, error: err.message };
  }
});

// Test database connection
ipcMain.handle('test-db-connection', async () => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    return { success: true, time: result.rows[0].current_time };
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return { success: false, error: err.message };
  }
});

// --------------------------------------------------
// DASHBOARD ANALYTICS
// --------------------------------------------------

ipcMain.handle('get-dashboard-analytics', async () => {
  try {
    console.log('📈 Fetching dashboard analytics...');
    
    // Get monthly bookings
    const monthlyBookings = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `);

    // Get revenue data
    const revenueData = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COALESCE(SUM(total_price), 0) as revenue
      FROM bookings
      WHERE payment_status = 'paid' 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `);

    // Get package popularity
    const packageData = await db.query(`
      SELECT 
        food_package,
        COUNT(*) as count
      FROM bookings
      WHERE food_package IS NOT NULL
      GROUP BY food_package
      ORDER BY count DESC
      LIMIT 5
    `);

    return {
      success: true,
      data: {
        monthlyBookings: monthlyBookings.rows,
        revenueData: revenueData.rows,
        packageData: packageData.rows
      }
    };
  } catch (err) {
    console.error('❌ DB Error (get-dashboard-analytics):', err);
    return { success: false, error: err.message };
  }
});

// --------------------------------------------------
// APP LIFECYCLE
// --------------------------------------------------

app.whenReady().then(() => {
  console.log('🚀 Starting Zaf\'s Kitchen Admin Dashboard...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('👋 Closing application...');
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('✅ Main process initialized');