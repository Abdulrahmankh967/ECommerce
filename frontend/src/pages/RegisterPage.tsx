import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '../api/auth.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ShoppingBag, Lock, Mail, User, Phone, CheckCircle2 } from 'lucide-react';

const registerSchema = z
  .object({
    fullName: z.string().min(4, 'Full Name must be at least 4 characters'),
    email: z.string().email('Please provide a valid email address'),
    phone: z.string().min(8, 'Please provide a valid phone number'),
    password: z.string().min(5, 'Password must be at least 5 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must accept the terms of service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'customer',
      });

      setSuccessMessage('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Registration failed. An account with this email may already exist.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Brand Showcase matching Screenshot Image 1, Frame 5 */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950 text-white relative">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">ShopNest</span>
            </Link>
            
            <div className="pt-8 space-y-2">
              <h2 className="text-3xl font-extrabold leading-snug">
                Join our premium community
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Enjoy instant access to exclusive member deals, priority shipping, tracked returns, and 24/7 specialist care.
              </p>
            </div>
          </div>

          <div className="my-6 flex justify-center">
            <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center p-4 border border-white/20 shadow-2xl">
              <ShoppingBag className="w-18 h-18 text-cyan-300" />
            </div>
          </div>

          <div className="space-y-2 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>Verified manufacturer warranties</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>Real-time delivery progress updates</span>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="space-y-1 mb-5">
            <h3 className="text-2xl font-black text-slate-900">Create an account</h3>
            <p className="text-xs text-slate-500">
              Sign up today to start shopping verified hardware.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 5 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 mt-0.5"
                  {...register('agreeTerms')}
                />
                <span>
                  I agree to the{' '}
                  <a href="#terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-rose-600">{errors.agreeTerms.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl shadow-md shadow-blue-600/20 mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center pt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
