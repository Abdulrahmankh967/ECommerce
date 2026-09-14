import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '../api/auth.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ShieldCheck, Lock, KeyRound, Check, X, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    verificationId: z.string().min(1, 'Verification ID is required'),
    otp: z.string().length(6, 'Verification code must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const verificationIdParam = searchParams.get('verificationId') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      verificationId: verificationIdParam,
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('newPassword') || '';

  // Password requirements checklist
  const hasMinLength = passwordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authApi.resetPassword({
        verificationId: data.verificationId,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      setSuccessMessage('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Password reset failed. Please verify your OTP code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-center space-y-6">
        
        {/* Shield with Checkmark Illustration matching Screenshot Image 1, Frame 3 */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm relative">
          <Lock className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Create a New Password</h2>
          <p className="text-xs text-slate-500">
            Enter your verification code and chosen new password below.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium text-left">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium text-left">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {!verificationIdParam && (
            <Input
              label="Verification ID"
              placeholder="Enter your verification ID"
              leftIcon={<KeyRound className="w-4 h-4" />}
              error={errors.verificationId?.message}
              {...register('verificationId')}
            />
          )}

          <Input
            label="6-Digit Verification Code (OTP)"
            placeholder="123456"
            maxLength={6}
            leftIcon={<KeyRound className="w-4 h-4" />}
            error={errors.otp?.message}
            {...register('otp')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Dynamic Password Requirements Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Password Requirements
            </span>
            <div className="space-y-1.5 text-xs">
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {hasUpperCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>One number</span>
              </div>
              <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {hasSpecialChar ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>One special character</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 rounded-xl shadow-md shadow-blue-600/20"
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </form>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
