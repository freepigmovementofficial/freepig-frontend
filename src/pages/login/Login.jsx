import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../api/auth';

export default function Login() {
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'VERIFY_OTP'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleAuthSuccess = (res) => {
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await authService.login(email, password);
        handleAuthSuccess(res);
      } else if (mode === 'REGISTER') {
        const res = await authService.register(name, email, password);
        setSuccessMsg(res.message || 'OTP sent! Please check your email.');
        setMode('VERIFY_OTP');
      } else if (mode === 'VERIFY_OTP') {
        const res = await authService.verifyOtp(email, otp);
        handleAuthSuccess(res);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Action failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setSuccessMsg('');
    setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center font-poppins px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent-teal rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white rounded-full blur-[150px]"></div>
      </div>

      <motion.div 
        className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="text-center mb-10">
          <h2 className="font-oswald text-4xl font-bold tracking-widest text-white mb-2">
            {mode === 'LOGIN' ? 'LOGIN' : mode === 'REGISTER' ? 'REGISTER' : 'VERIFY EMAIL'}
          </h2>
          <p className="text-gray-400 text-sm tracking-widest">
            {mode === 'VERIFY_OTP' ? `OTP sent to ${email}` : 'ENTER TO THE MOVEMENT'}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs tracking-wide"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs tracking-wide"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {mode === 'REGISTER' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-2"
              >
                <label className="text-xs font-bold text-gray-300 tracking-widest uppercase">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="John Doe"
                  className="w-full bg-[#222] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition duration-300"
                />
              </motion.div>
            )}

            {mode !== 'VERIFY_OTP' && (
              <motion.div
                key="auth-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-300 tracking-widest uppercase">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full bg-[#222] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition duration-300"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-300 tracking-widest uppercase">Password</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === 'REGISTER' ? 8 : 1}
                    placeholder="••••••••"
                    className="w-full bg-[#222] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition duration-300"
                  />
                  {mode === 'REGISTER' && (
                    <span className="text-[10px] text-gray-500 tracking-wider">Must be at least 8 characters.</span>
                  )}
                </div>
              </motion.div>
            )}

            {mode === 'VERIFY_OTP' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-2"
              >
                <label className="text-xs font-bold text-gray-300 tracking-widest uppercase">6-Digit OTP</label>
                <input 
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="w-full bg-[#222] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition duration-300 tracking-[0.5em] text-center text-lg font-bold"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="mt-4 px-8 py-3.5 bg-transparent border border-white/60 rounded-full hover:bg-white hover:border-white hover:text-black transition duration-300 text-white text-[12px] font-bold tracking-[0.15em] uppercase w-full disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? 'PROCESSING...' : mode === 'LOGIN' ? 'SIGN IN' : mode === 'REGISTER' ? 'SIGN UP' : 'VERIFY'}
          </motion.button>
        </form>

        {mode !== 'VERIFY_OTP' && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={toggleMode} type="button" className="text-accent-teal hover:text-white transition duration-300 uppercase font-bold">
                {mode === 'LOGIN' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
