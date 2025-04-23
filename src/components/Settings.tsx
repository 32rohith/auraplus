import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import SubscriptionPlans from './SubscriptionPlans';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Label,
  Input,
  Button,
  Textarea,
  Switch
} from '@/components/ui';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'react-hot-toast';
import { User as FirebaseUser } from 'firebase/auth';
import { Subscription, SubscriptionTier, UserPreferences } from '@/types';

interface SettingsProps {
  onClose?: () => void;
  user?: FirebaseUser | null;
}

export function Settings({ onClose, user: propUser }: SettingsProps) {
  const { user: contextUser } = useAuth() || { user: null };
  const user = propUser || contextUser;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [therapistContext, setTherapistContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({
    tier: SubscriptionTier.FREE,
    sessions_limit: 3,
    sessions_used: 0,
    session_duration_limit: 10,
    renewal_date: null
  });

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setNotifications(userData.preferences?.notifications !== false);
          setDarkMode(userData.preferences?.darkMode || false);
          setTherapistContext(userData.therapist_context || '');
          
          // Load subscription data
          if (userData.subscription) {
            setSubscription({
              tier: userData.subscription.tier || SubscriptionTier.FREE,
              sessions_limit: userData.subscription.sessions_limit || 3,
              sessions_used: userData.subscription.sessions_used || 0,
              session_duration_limit: userData.subscription.session_duration_limit || 10,
              renewal_date: userData.subscription.renewal_date || null
            });
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast('Failed to load settings');
      }
    };

    loadUserSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const preferences: UserPreferences = {
        notifications,
        darkMode
      };
      
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        preferences,
        therapist_context: therapistContext,
        updated_at: new Date().toISOString()
      });
      
      toast('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubscriptionUpdate = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.subscription) {
          setSubscription({
            tier: userData.subscription.tier || SubscriptionTier.FREE,
            sessions_limit: userData.subscription.sessions_limit || 3,
            sessions_used: userData.subscription.sessions_used || 0,
            session_duration_limit: userData.subscription.session_duration_limit || 10,
            renewal_date: userData.subscription.renewal_date || null
          });
        }
      }
    } catch (error) {
      console.error('Error loading updated subscription:', error);
    }
  };

  const formatRenewalDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    
    if (typeof dateValue === 'object' && 'seconds' in dateValue) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString();
    }
    
    return 'N/A';
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose} size="sm">
            Close
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="therapist">Therapist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                placeholder="Your name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                placeholder="Your email"
                disabled
              />
              <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive session reminders and tips
                </p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the application
                </p>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="subscription">
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-4">Current Subscription</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">{subscription.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Renewal</p>
                  <p className="font-medium">{formatRenewalDate(subscription.renewal_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Limit</p>
                  <p className="font-medium">{subscription.sessions_used} / {subscription.sessions_limit} this month</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Duration</p>
                  <p className="font-medium">{subscription.session_duration_limit} minutes</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
              {user && (
                <SubscriptionPlans 
                  userId={user.uid} 
                  currentTier={subscription.tier}
                  onSubscriptionUpdate={handleSubscriptionUpdate}
                />
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="therapist">
          <div className="space-y-4">
            <div>
              <Label htmlFor="therapist-context">Therapist Context</Label>
              <Textarea 
                id="therapist-context" 
                value={therapistContext} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTherapistContext(e.target.value)} 
                placeholder="Add context to personalize your therapy experience"
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This helps tailor conversations with your AI therapist
              </p>
            </div>
            
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings; 