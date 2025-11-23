/**
 * SMS Service Integration for GT2 System
 *
 * SRS Requirements:
 * - 3.10.4: SMS service for notifications to drivers and townspeople
 * - 3.1.1.1.6: Send SMS to driver when route is assigned
 * - 2.1: Dialog Ideamart API integration (Sri Lankan SMS service)
 *
 * This service handles SMS notifications through Dialog Ideamart API.
 *
 * To complete integration:
 * 1. Sign up for Dialog Ideamart account at https://www.ideamart.io/
 * 2. Create an SMS application and get API credentials
 * 3. Add credentials to firebase config or environment variables
 * 4. Implement the actual API calls below
 */

// Dialog Ideamart SMS API configuration
const SMS_CONFIG = {
  apiKey: process.env.IDEAMART_API_KEY || 'YOUR_IDEAMART_API_KEY',
  appId: process.env.IDEAMART_APP_ID || 'YOUR_APP_ID',
  password: process.env.IDEAMART_PASSWORD || 'YOUR_PASSWORD',
  endpoint: 'https://www.ideamart.io/sms/v2/send',
};

/**
 * Send SMS to a single recipient
 * @param {string} phoneNumber - Recipient phone number (Sri Lankan format: +94XXXXXXXXX)
 * @param {string} message - Message content (max 160 characters for single SMS)
 * @returns {Promise<Object>} API response
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    console.log('Sending SMS to:', phoneNumber);
    console.log('Message:', message);

    // TODO: Implement actual Dialog Ideamart API call
    // Example structure:
    /*
    const response = await fetch(SMS_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        appId: SMS_CONFIG.appId,
        password: SMS_CONFIG.password,
        destinationAddresses: [phoneNumber],
        message: message,
        sourceAddress: 'GT2System', // Your sender ID
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`SMS API error: ${data.message}`);
    }

    return {
      success: true,
      messageId: data.messageId,
      status: data.status,
    };
    */

    // For development: log instead of sending
    console.log('[SMS Service] Would send SMS:', { phoneNumber, message });

    return {
      success: true,
      messageId: 'dev-' + Date.now(),
      status: 'sent',
      note: 'Development mode - SMS not actually sent',
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

/**
 * Send route assignment notification to driver (SRS 3.1.1.1.6)
 * @param {Object} driver - Driver object with phoneNumber
 * @param {Object} route - Route object with details
 * @returns {Promise<Object>} SMS sending result
 */
export const notifyDriverAboutRoute = async (driver, route) => {
  const message = `GT2 Alert: You have been assigned to route "${route.name}" on ${route.schedule.day} at ${route.schedule.startTime}. Duration: ${route.schedule.estimatedDuration || 'N/A'} mins.`;

  return sendSMS(driver.phoneNumber, message);
};

/**
 * Send route activation notification to subscribed townspeople (SRS 3.1.1.1.5)
 * After 10-minute delay
 * @param {Array<Object>} users - Array of user objects with notification preferences
 * @param {Object} route - Route object
 * @param {number} delayMinutes - Delay before sending (default: 10 minutes per SRS)
 * @returns {Promise<Array<Object>>} Array of SMS sending results
 */
export const notifyUsersAboutRoute = async (users, route, delayMinutes = 10) => {
  // Wait for the specified delay (SRS 3.1.1.1.5: 10-minute delay)
  if (delayMinutes > 0) {
    console.log(`Waiting ${delayMinutes} minutes before sending route notifications...`);
    // In production, this should be handled by a background job/cloud function
    // await new Promise(resolve => setTimeout(resolve, delayMinutes * 60 * 1000));
  }

  const results = [];

  for (const user of users) {
    // Check if user wants SMS notifications
    const profile = user.profile?.notificationProfiles?.find(
      p => p.routeIds.includes(route.id) && p.enabled
    );

    if (!profile) continue;

    if (profile.notificationMethod === 'sms' || profile.notificationMethod === 'both') {
      if (user.profile.phoneNumber) {
        const message = `GT2 Alert: Route "${route.name}" is now active. Estimated arrival in your area in ${profile.advanceTime} minutes.`;

        try {
          const result = await sendSMS(user.profile.phoneNumber, message);
          results.push({ userId: user.id, ...result });
        } catch (error) {
          results.push({ userId: user.id, success: false, error: error.message });
        }
      }
    }
  }

  return results;
};

/**
 * Send estimated arrival notification (SRS 3.1.2.1)
 * @param {string} phoneNumber - User's phone number
 * @param {Object} route - Route object
 * @param {number} estimatedMinutes - Minutes until truck arrives
 * @returns {Promise<Object>} SMS sending result
 */
export const notifyUserAboutArrival = async (phoneNumber, route, estimatedMinutes) => {
  const message = `GT2 Alert: Garbage truck on route "${route.name}" will arrive at your location in approximately ${estimatedMinutes} minutes.`;

  return sendSMS(phoneNumber, message);
};

/**
 * Send batch SMS to multiple recipients
 * @param {Array<Object>} recipients - Array of {phoneNumber, message} objects
 * @returns {Promise<Array<Object>>} Array of results
 */
export const sendBatchSMS = async (recipients) => {
  const results = [];

  // Send SMS one by one (or use batch API if available)
  for (const recipient of recipients) {
    try {
      const result = await sendSMS(recipient.phoneNumber, recipient.message);
      results.push({ phoneNumber: recipient.phoneNumber, ...result });
    } catch (error) {
      results.push({
        phoneNumber: recipient.phoneNumber,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Format Sri Lankan phone number
 * @param {string} phoneNumber - Phone number in various formats
 * @returns {string} Formatted phone number (+94XXXXXXXXX)
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove spaces, dashes, and other non-numeric characters
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Convert local format (0XXXXXXXXX) to international (+94XXXXXXXXX)
  if (cleaned.startsWith('0')) {
    cleaned = '+94' + cleaned.substring(1);
  }

  // Add +94 if missing
  if (!cleaned.startsWith('+94')) {
    cleaned = '+94' + cleaned;
  }

  return cleaned;
};

export default {
  sendSMS,
  notifyDriverAboutRoute,
  notifyUsersAboutRoute,
  notifyUserAboutArrival,
  sendBatchSMS,
  formatPhoneNumber,
};
