import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff, User, Building } from 'lucide-react';

interface SignupFormProps {
  onSignup: (email: string, password: string, name: string, userRole: string) => Promise<void>;
  onSwitchToLogin: () => void;
  loading?: boolean;
  error?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSignup,
  onSwitchToLogin,
  loading = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userRole, setUserRole] = useState('individual');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordError('');
    
    try {
      await onSignup(email, password, name, userRole);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#131520] border border-[rgba(200,150,60,0.22)]">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-[#F0EAD6]">
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || passwordError) && (
            <Alert variant="destructive">
              <AlertDescription>{error || passwordError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#8A8070]">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#8A8070]">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Account Type</Label>
            <RadioGroup value={userRole} onValueChange={setUserRole}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <div className="space-y-1">
                  <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Personal Account
                  </Label>
                  <p className="text-sm text-[#8A8070]">
                    For individuals recording their own personal documents and certificates.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="trustee" id="trustee" />
                <div className="space-y-1">
                  <Label htmlFor="trustee" className="flex items-center gap-2 cursor-pointer">
                    <Building className="h-4 w-4" />
                    Trustee Account
                  </Label>
                  <p className="text-sm text-[#8A8070]">
                    For professionals recording documents on behalf of clients as a lawful agent or administrator.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#8A8070]">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#8A8070]">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-[#8A8070]">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToLogin}
                className="text-[#C8963C] hover:text-[#D4A84A] p-0"
              >
                Sign in
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;