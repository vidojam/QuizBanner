import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SubscriptionInfo {
  isActive: boolean;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  status: 'none' | 'active' | 'expired' | 'cancelled';
  needsRenewal: boolean;
}

interface SubscriptionStatusProps {
  subscriptionInfo?: SubscriptionInfo;
  userTier: 'free' | 'premium';
  onUpgrade?: () => void;
  onRenew?: () => void;
}

export function SubscriptionStatus({ 
  subscriptionInfo, 
  userTier, 
  onUpgrade, 
  onRenew 
}: SubscriptionStatusProps) {
  const { t } = useTranslation();

  if (!subscriptionInfo && userTier === 'free') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            {t('freeTier')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {t('freeTierDescription')}
          </p>
          {onUpgrade && (
            <Button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700">
              {t('upgradeButton')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo) return null;

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Subscription is active and not expiring soon
  if (subscriptionInfo.isActive && !subscriptionInfo.needsRenewal) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {t('premiumActive')}
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {t('active')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {subscriptionInfo.expiresAt && (
              <span>
                {t('renewsOn')} {formatExpiryDate(subscriptionInfo.expiresAt)}
              </span>
            )}
          </div>
          {subscriptionInfo.daysUntilExpiry && (
            <p className="text-xs text-gray-500 mt-2">
              {subscriptionInfo.daysUntilExpiry} {t('daysRemaining')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Subscription needs renewal (expires within 7 days)
  if (subscriptionInfo.isActive && subscriptionInfo.needsRenewal) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">{t('renewalNeeded')}</AlertTitle>
        <AlertDescription className="text-yellow-700">
          <div className="space-y-2">
            <p>
              {t('subscriptionExpiresSoon')} {' '}
              {subscriptionInfo.expiresAt && formatExpiryDate(subscriptionInfo.expiresAt)} 
              {' '} ({subscriptionInfo.daysUntilExpiry} {t('daysRemaining')})
            </p>
            {onRenew && (
              <Button 
                onClick={onRenew} 
                size="sm" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {t('renewNow')}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Subscription is expired
  if (subscriptionInfo.status === 'expired') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertTitle className="text-red-800">{t('subscriptionExpired')}</AlertTitle>
        <AlertDescription className="text-red-700">
          <div className="space-y-2">
            <p>
              {t('subscriptionExpiredOn')} {' '}
              {subscriptionInfo.expiresAt && formatExpiryDate(subscriptionInfo.expiresAt)}
            </p>
            <p className="text-sm">
              {t('downgradedToFree')}
            </p>
            {onRenew && (
              <Button 
                onClick={onRenew} 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('renewSubscription')}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Subscription is cancelled
  if (subscriptionInfo.status === 'cancelled') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="w-4 h-4 text-orange-600" />
        <AlertTitle className="text-orange-800">{t('subscriptionCancelled')}</AlertTitle>
        <AlertDescription className="text-orange-700">
          <div className="space-y-2">
            <p>
              {t('accessUntil')} {' '}
              {subscriptionInfo.expiresAt && formatExpiryDate(subscriptionInfo.expiresAt)}
            </p>
            {onRenew && (
              <Button 
                onClick={onRenew} 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {t('reactivateSubscription')}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}