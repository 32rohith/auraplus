import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SubscriptionTier, Plan, PlanFeature } from '@/types';

interface SubscriptionPlansProps {
  userId: string;
  currentTier: SubscriptionTier | string;
  onSubscriptionUpdate?: () => void;
}

export function SubscriptionPlans({ userId, currentTier, onSubscriptionUpdate }: SubscriptionPlansProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const plans: Plan[] = [
    {
      id: SubscriptionTier.FREE,
      name: 'Free',
      price: '$0',
      description: 'Basic access to therapy sessions',
      features: [
        { name: '3 sessions per month', included: true },
        { name: '10 minutes per session', included: true },
        { name: 'Basic session history', included: true },
        { name: 'Extended session history', included: false },
        { name: 'Priority support', included: false },
      ],
      sessionLimit: 3,
      durationLimit: 10,
    },
    {
      id: SubscriptionTier.PLUS,
      name: 'Plus',
      price: '$12',
      description: 'Enhanced therapy experience',
      features: [
        { name: '8 sessions per month', included: true },
        { name: '20 minutes per session', included: true },
        { name: 'Basic session history', included: true },
        { name: 'Extended session history', included: true },
        { name: 'Priority support', included: false },
      ],
      sessionLimit: 8,
      durationLimit: 20,
      recommended: true,
    },
    {
      id: SubscriptionTier.PRO,
      name: 'Pro',
      price: '$20',
      description: 'Premium therapy experience',
      features: [
        { name: '20 sessions per month', included: true },
        { name: '30 minutes per session', included: true },
        { name: 'Basic session history', included: true },
        { name: 'Extended session history', included: true },
        { name: 'Priority support', included: true },
      ],
      sessionLimit: 20,
      durationLimit: 30,
    }
  ];

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (planId === currentTier) return;
    
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      const selectedPlan = plans.find(plan => plan.id === planId);
      
      if (!selectedPlan) throw new Error('Invalid plan selected');
      
      // In a real app, you would integrate with a payment processor here
      // For now, we'll just update the user document directly
      await updateDoc(userDocRef, {
        'subscription.tier': planId,
        'subscription.sessions_limit': selectedPlan.sessionLimit,
        'subscription.session_duration_limit': selectedPlan.durationLimit,
        'subscription.updated_at': new Date().toISOString(),
        // In a real app, you would set renewal dates based on payment
        'subscription.renewal_date': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });
      
      toast('Subscription updated successfully');
      if (onSubscriptionUpdate) onSubscriptionUpdate();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast('Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`flex flex-col h-full ${plan.recommended ? 'border-primary shadow-md relative' : ''}`}
        >
          {plan.recommended && (
            <Badge className="absolute -top-2 right-4 bg-primary text-white">
              Recommended
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {plan.name}
              {plan.id === SubscriptionTier.PRO && <Star className="h-4 w-4 text-yellow-500" />}
            </CardTitle>
            <div className="mt-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className={`mr-2 mt-1 ${feature.included ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    {feature.included ? <Check className="h-4 w-4" /> : '•'}
                  </span>
                  <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className={`w-full ${plan.id === currentTier ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
              variant={plan.id === currentTier ? 'outline' : 'default'}
              disabled={isUpdating || plan.id === currentTier}
              onClick={() => handleUpgrade(plan.id)}
            >
              {plan.id === currentTier ? 'Current Plan' : 'Upgrade'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default SubscriptionPlans; 