import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const form = useForm({
    defaultValues: { email: '', password: '' },
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const onSubmit = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    if (mode === 'signup') {
      // Try to sign up
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) {
        if (error.message.toLowerCase().includes('user already registered')) {
          toast({
            title: 'Email already registered',
            description: 'Please log in or use a different email.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        }
        setSubmitting(false);
        return;
      }
      toast({ title: 'Check your email', description: 'A confirmation link has been sent.' });
      // User will be rerouted after confirmation and login
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }
      // User will be rerouted by useEffect
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}>
      <h2 className="text-2xl font-bold mb-4 text-center">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
          </Button>
        </form>
      </Form>
      <div className="text-center mt-4">
        {mode === 'login' ? (
          <span>
            Don&apos;t have an account?{' '}
            <button className="text-blue-600 hover:underline" onClick={() => setMode('signup')} disabled={submitting}>
              Sign Up
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button className="text-blue-600 hover:underline" onClick={() => setMode('login')} disabled={submitting}>
              Login
            </button>
          </span>
        )}
      </div>
    </div>
  );
} 