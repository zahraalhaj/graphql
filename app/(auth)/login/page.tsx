'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/app/lib/auth';
import AnimatedBackground from '@/app/components/AnimatedBackground';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const credentials = btoa(`${identifier}:${password}`);
      const token = await signIn(credentials);
      
      if (token && token.includes('.')) {
        localStorage.setItem('token', token);
        console.log('Token stored:', token);
        router.replace('/dashboard');
      } else {
        setError('Invalid token received');
      }
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="relative max-w-md w-full">
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
          
          {/* Main card */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            <div className="p-8">
              <h2 className="text-4xl font-bold text-center text-white mb-8 tracking-tight">
                Welcome Back
              </h2>
              
              {error && (
                <div className="bg-red-500/10 backdrop-blur-sm text-red-200 p-4 rounded-xl mb-6 border border-red-500/20">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="identifier" className="block text-sm font-medium text-white/80">
                    Username or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 
                               text-white placeholder-white/50 focus:border-blue-500/50 focus:ring-0
                               transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 
                               text-white placeholder-white/50 focus:border-blue-500/50 focus:ring-0
                               transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl
                           hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 
                           transition-all duration-200 font-medium shadow-lg hover:shadow-xl
                           focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Sign In
                </button>
              </form>

              {/* Bottom decorative dots */}
              <div className="flex justify-center space-x-2 mt-8">
                <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-pink-500/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 