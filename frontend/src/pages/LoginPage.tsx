import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  ShoppingBag,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  // 1. أضفنا user / isAuthenticated من الـ hook
  const { login, verifyOTP, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/shop';

  // 2. فحص حالة الدخول وتحويل المستخدم فوراً إذا كان مسجّل دخول
  useEffect(() => {
    if (user || isAuthenticated) {
      if (user?.role?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await login(data);

      setVerificationId(res.verificationId);
      setShowOtpModal(true);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const authenticatedUser = await verifyOTP({
        verificationId,
        otp: otpCode,
      });

      setShowOtpModal(false);

      // Redirect based on the authenticated user's role
      if (authenticatedUser.role?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setOtpError(
        err?.response?.data?.message ||
        'Verification failed. Please check the code.'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white relative">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>

              <span className="text-lg font-bold tracking-tight">
                ShopNest
              </span>
            </Link>

            <div className="pt-8 space-y-2">
              <h2 className="text-3xl font-extrabold leading-snug">
                Great to see you again!
              </h2>

              <p className="text-xs text-blue-100 leading-relaxed">
                Log in to access your saved wishlist, review your past orders,
                and enjoy tailored discounts.
              </p>
            </div>
          </div>

          <div className="my-8 flex justify-center">
            <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center p-4 border border-white/20 shadow-2xl">
              <ShoppingBag className="w-20 h-20 text-cyan-300" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-200">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Encrypted, secure authentication with 2FA OTP</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2 mb-6">
            <h3 className="text-2xl font-black text-slate-900">
              Welcome back!
            </h3>

            <p className="text-xs text-slate-500">
              Enter your credentials to access your account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />

                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl shadow-md shadow-blue-600/20"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-4">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">
              Or continue with
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <span className="font-bold text-red-500">G</span>
                Google
              </button>

              <button
                type="button"
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <span className="font-bold text-slate-900"></span>
                Apple
              </button>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-blue-600 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Two-Factor Authentication"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Enter Verification Code
            </h4>

            <p className="text-xs text-slate-500">
              We've dispatched a 6-digit OTP code to your registered email
              address.
            </p>
          </div>

          {otpError && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">
              {otpError}
            </div>
          )}

          <form
            onSubmit={handleVerifyOtp}
            className="space-y-4 text-left"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                6-Digit Code
              </label>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, ''))
                }
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-xl font-bold py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 rounded-xl"
              isLoading={otpLoading}
            >
              Verify & Log In
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};