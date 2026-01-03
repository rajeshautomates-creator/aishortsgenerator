'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Youtube, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      await login(password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message : 'Failed to login. Please check your password.';
      setError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <Youtube className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            AI Shorts Generator
          </h1>
          <p className="text-muted-foreground flex items-center gap-1 justify-center">
            Powerful tool for viral content <Sparkles className="w-4 h-4 text-accent" />
          </p>
        </div>

        <div className="glass p-8 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Enter admin password"
                  className="input-field pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary w-full h-12 rounded-xl text-base font-semibold transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoggingIn ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Restricted access for authorized administrators only.
        </p>
      </motion.div>
    </div>
  );
}
