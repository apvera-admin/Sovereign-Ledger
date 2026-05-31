import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Save, User, Mail, Shield } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ProfileImageUpload from './ProfileImageUpload';
import { getPasswordResetHelp } from '@/utils/passwordResetHelp';

interface ProfilePageProps {
  userEmail: string;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userEmail, onBack }) => {
  const { user, userProfile, refreshProfile } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState(userEmail);
  const [sendingResetLink, setSendingResetLink] = useState(false);
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const saveInProgressRef = useRef(false);
  const initialDataRef = useRef<{fullName: string; displayName: string; profileImageUrl: string} | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (userProfile && mountedRef.current) {
      const newFullName = userProfile.full_name || '';
      const newDisplayName = userProfile.display_name || '';
      const newProfileImageUrl = userProfile.profile_image_url || '';
      
      setFullName(newFullName);
      setDisplayName(newDisplayName);
      setProfileImageUrl(newProfileImageUrl);
      
      // Store initial data to prevent unnecessary saves
      initialDataRef.current = {
        fullName: newFullName,
        displayName: newDisplayName,
        profileImageUrl: newProfileImageUrl
      };
    }
  }, [userProfile]);

  useEffect(() => {
    setResetEmail(userEmail);
  }, [userEmail]);

  const handleSave = async () => {
    if (!user || saveInProgressRef.current || !mountedRef.current) {
      return;
    }

    // Check if data has actually changed
    const currentData = {
      fullName: fullName.trim(),
      displayName: displayName.trim(),
      profileImageUrl: profileImageUrl
    };

    if (initialDataRef.current && 
        initialDataRef.current.fullName === currentData.fullName &&
        initialDataRef.current.displayName === currentData.displayName &&
        initialDataRef.current.profileImageUrl === currentData.profileImageUrl) {
      toast({
        title: 'No changes detected',
        description: 'Your profile is already up to date.',
      });
      return;
    }

    saveInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      const updateData = {
        full_name: currentData.fullName,
        display_name: currentData.displayName,
        profile_image_url: currentData.profileImageUrl,
        updated_at: new Date().toISOString()
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existingProfile) {
        result = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            ...updateData
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Update initial data reference
      initialDataRef.current = currentData;
      
      // Refresh profile data
      await refreshProfile();
      
      if (mountedRef.current) {
        toast({
          title: 'Profile updated successfully',
          description: 'Your profile information has been saved.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (mountedRef.current) {
        toast({
          title: 'Error updating profile',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      saveInProgressRef.current = false;
    }
  };

  const handleImageUpload = (url: string) => {
    setProfileImageUrl(url);
  };

  const handleSendPasswordSetupLink = async () => {
    if (!resetEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Enter an email to send a password setup link.',
        variant: 'destructive',
      });
      return;
    }

    setSendingResetLink(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo,
      });

      if (error) throw error;

      toast({
        title: 'Set password link sent',
        description: `A secure setup link was sent to ${resetEmail.trim()}.`,
      });
    } catch (error: any) {
      console.error('Failed to send password setup link:', error);
      const hint = getPasswordResetHelp(error?.message);
      toast({
        title: 'Could not send link',
        description: hint || error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingResetLink(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0C0D11] p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImageUrl} alt={displayName || fullName} />
                <AvatarFallback className="bg-[#131520] text-[#C8963C] text-2xl">
                  {getInitials(displayName || fullName || userEmail)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#8A8070]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Type
                </Label>
                <div className="p-3 bg-[#111318] rounded-md border border-[rgba(255,255,255,0.06)]">
                  <p className="font-medium">
                    {userProfile?.user_role === 'trustee' ? 'Trustee / Business' : 'Individual'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.user_role === 'trustee' 
                      ? 'Trustee accounts can upload documents on behalf of clients'
                      : 'Individual accounts for personal document recording'
                    }
                  </p>
                </div>
              </div>

              {user && (
                <ProfileImageUpload
                  currentImageUrl={profileImageUrl}
                  onImageUpload={handleImageUpload}
                  userId={user.id}
                />
              )}

              <div className="space-y-3 p-4 rounded-md border bg-slate-50">
                <Label htmlFor="reset-email" className="font-medium">Send "Set Your Password" Link</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="client@example.com"
                  disabled={sendingResetLink}
                />
                <p className="text-xs text-muted-foreground">
                  The secure, email-specific password setup link is sent directly to this inbox.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                  onClick={handleSendPasswordSetupLink}
                  disabled={sendingResetLink}
                >
                  {sendingResetLink ? 'Sending link...' : 'Send Set Password Link'}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
