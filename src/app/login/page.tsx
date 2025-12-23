'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { login, signup, signInWithGithub } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn, UserPlus, Github, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    // The form action will handle the redirect, so we don't need to do much here
    // But we can add some loading state if we want better UX
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-white/3 backdrop-blur-xl border-white/8 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          {/* Subtle line effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />
          
          <div className="text-center mb-8">
            <motion.h1 
              key={isLogin ? 'login-head' : 'signup-head'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent mb-2"
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </motion.h1>
            <p className="text-white/40 text-sm">
              {isLogin ? 'Enter your credentials to continue' : 'Join us and start your journey today'}
            </p>
          </div>

          <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/50 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-white/2 border-white/10 pl-10 h-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-white/50 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-white/2 border-white/10 pl-10 h-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  {isLogin ? 'Sign In' : 'Register'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121212] px-2 text-white/30">Or continue with</span>
              </div>
            </div>

            <form action={signInWithGithub}>
              <Button 
                type="submit"
                variant="outline" 
                className="w-full h-11 bg-white/2 border-white/10 hover:bg-white/5 hover:border-white/20 text-white/80 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/40 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
