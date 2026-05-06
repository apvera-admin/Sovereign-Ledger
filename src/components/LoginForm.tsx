import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  loading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onSwitchToSignup,
  onForgotPassword,
  loading = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#131520] border border-[rgba(200,150,60,0.22)]">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-[#F0EAD6]">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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
          
          <Button
            type="submit"
            className="w-full bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="link"
              onClick={onForgotPassword}
              className="text-sm text-[#C8963C] hover:text-[#D4A84A]"
            >
              Forgot your password?
            </Button>
            <div className="text-sm text-[#8A8070]">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToSignup}
                className="text-[#C8963C] hover:text-[#D4A84A] p-0"
              >
                Sign up
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;