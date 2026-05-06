import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Save, User, Mail, Shield } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface TrusteeProfileProps {
  onBack: () => void;
}

const TrusteeProfile: React.FC<TrusteeProfileProps> = ({ onBack }) => {
  const { user, userProfile, refreshProfile } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setDisplayName(userProfile.display_name || '');
      setProfileImageUrl(userProfile.profile_image_url || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        full_name: fullName,
        display_name: displayName,
        profile_image_url: profileImageUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
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
                {getInitials(displayName || fullName || user?.email || '')}
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
                value={user?.email || ''}
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
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

            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL (Optional)</Label>
              <Input
                id="profileImage"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
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
  );
};

export default TrusteeProfile;