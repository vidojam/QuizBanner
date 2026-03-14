import { db, users } from "./db";
import { eq, sql } from "drizzle-orm";

export interface SubscriptionInfo {
  isActive: boolean;
  expiresAt: Date | null;
  daysUntilExpiry: number | null;
  status: 'none' | 'active' | 'expired' | 'cancelled';
  needsRenewal: boolean;
}

export class SubscriptionManager {
  /**
   * Check if user's subscription is active and not expired
   */
  static async checkSubscriptionStatus(userId: string): Promise<SubscriptionInfo> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user.length) {
      return {
        isActive: false,
        expiresAt: null,
        daysUntilExpiry: null,
        status: 'none',
        needsRenewal: false
      };
    }

    const userData = user[0];
    const now = new Date();
    const expiresAt = userData.subscriptionExpiresAt ? new Date(userData.subscriptionExpiresAt) : null;
    const status = userData.subscriptionStatus as 'none' | 'active' | 'expired' | 'cancelled' || 'none';
    
    let isActive = false;
    let daysUntilExpiry = null;
    let needsRenewal = false;

    if (expiresAt) {
      daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isActive = expiresAt > now && status === 'active';
      needsRenewal = daysUntilExpiry <= 7 && daysUntilExpiry > 0; // Warn 7 days before expiry
    }

    return {
      isActive,
      expiresAt,
      daysUntilExpiry,
      status,
      needsRenewal
    };
  }

  /**
   * Update user's subscription after successful payment
   */
  static async activateSubscription(
    userId: string, 
    stripeSubscriptionId: string,
    stripeCustomerId?: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Add 1 month
    
    const updateData: any = {
      tier: 'premium',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: expiresAt.toISOString(),
      stripeSubscriptionId,
      lastPaymentDate: new Date().toISOString(),
      upgradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (stripeCustomerId) {
      updateData.stripeCustomerId = stripeCustomerId;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }

  /**
   * Handle subscription expiry - downgrade to free tier
   */
  static async expireSubscription(userId: string): Promise<void> {
    await db.update(users)
      .set({
        tier: 'free',
        subscriptionStatus: 'expired',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  /**
   * Cancel subscription - user can still use premium until expiry
   */
  static async cancelSubscription(userId: string): Promise<void> {
    await db.update(users)
      .set({
        subscriptionStatus: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  /**
   * Check and update expired subscriptions for all users
   * This should be run periodically (e.g., daily cron job)
   */
  static async processExpiredSubscriptions(): Promise<void> {
    const now = new Date().toISOString();
    
    // Find users with expired subscriptions
    const expiredUsers = await db.select({ id: users.id })
      .from(users)
      .where(sql`
        subscription_expires_at IS NOT NULL 
        AND subscription_expires_at < ${now}
        AND subscription_status = 'active'
      `);

    // Update all expired users to free tier
    for (const user of expiredUsers) {
      await this.expireSubscription(user.id);
      console.log(`Subscription expired for user ${user.id}, downgraded to free tier`);
    }
  }

  /**
   * Get users who need renewal reminders (subscription expires within 7 days)
   */
  static async getUsersNeedingRenewalReminder(): Promise<string[]> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const usersNeedingReminder = await db.select({ id: users.id })
      .from(users)
      .where(sql`
        subscription_expires_at IS NOT NULL 
        AND subscription_expires_at <= ${sevenDaysFromNow.toISOString()}
        AND subscription_expires_at > ${new Date().toISOString()}
        AND subscription_status = 'active'
      `);

    return usersNeedingReminder.map(user => user.id);
  }
}

export default SubscriptionManager;