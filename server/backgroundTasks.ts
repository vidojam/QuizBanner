import SubscriptionManager from './subscriptionManager';

/**
 * Background task to check and process expired subscriptions
 * Should be run daily (e.g., via cron job)
 */
export async function processExpiredSubscriptions() {
  try {
    console.log('Starting expired subscription check...');
    await SubscriptionManager.processExpiredSubscriptions();
    console.log('Expired subscription check completed');
  } catch (error) {
    console.error('Error processing expired subscriptions:', error);
  }
}

/**
 * Background task to send renewal reminders to users
 * Should be run daily to notify users 7 days before expiry
 */
export async function sendRenewalReminders() {
  try {
    console.log('Checking for users needing renewal reminders...');
    const userIds = await SubscriptionManager.getUsersNeedingRenewalReminder();
    
    for (const userId of userIds) {
      // Here you would integrate with your email service (e.g., SendGrid, AWS SES)
      console.log(`User ${userId} needs renewal reminder - subscription expires within 7 days`);
      
      // Example: Send email notification
      // await emailService.sendRenewalReminder(userId);
      
      // For now, just log it
      console.log(`Renewal reminder needed for user: ${userId}`);
    }
    
    console.log(`Processed ${userIds.length} renewal reminders`);
  } catch (error) {
    console.error('Error sending renewal reminders:', error);
  }
}

/**
 * Start background tasks - call this when the server starts
 */
export function startBackgroundTasks() {
  // Run expired subscription check daily at midnight
  const runDaily = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      processExpiredSubscriptions();
      sendRenewalReminders();
      
      // Then run every 24 hours
      setInterval(() => {
        processExpiredSubscriptions();
        sendRenewalReminders();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilMidnight);
  };
  
  console.log('Background subscription tasks scheduled');
  runDaily();
  
  // Also run immediately on startup (useful for development/testing)
  if (process.env.NODE_ENV === 'development') {
    console.log('Running initial subscription check (development mode)');
    setTimeout(() => {
      processExpiredSubscriptions();
      sendRenewalReminders();
    }, 5000); // Wait 5 seconds after startup
  }
}