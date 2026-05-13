import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/utils/supabaseUtils';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. The server may be unavailable — please try again in a moment.')), 30000)
      );

      const { error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeout
      ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

      if (error) throw error;

      toast({ title: 'Success', description: 'Signed in successfully!' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string, userRole: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: undefined, // Disable email confirmation
        },
      });
      
      if (error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please wait a moment and try again.');
        }
        throw error;
      }
      
      if (data.user) {
        const profileResult = await createUserProfile(data.user.id, email, name, userRole);
        if (!profileResult.success) {
          console.error('Failed to create user profile:', profileResult.error);
        }
        
        toast({
          title: 'Success',
          description: 'Account created successfully!',
        });
        
        // Automatically redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    toast({
      title: 'Password Reset',
      description: 'Password reset functionality coming soon!',
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => setMode('signup')}
              onForgotPassword={handleForgotPassword}
              loading={loading}
              error={error}
            />
          ) : (
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setMode('login')}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;
