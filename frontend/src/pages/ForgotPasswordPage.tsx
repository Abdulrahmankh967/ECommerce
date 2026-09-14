import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '../api/auth.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const res = await authApi.forgotPassword(data);
      setMessage(res.message);

      // If a verificationId is returned, smoothly transition to Reset Password
      if (res.verificationId) {
        setTimeout(() => {
          navigate(`/reset-password?verificationId=${encodeURIComponent(res.verificationId!)}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Failed to request password reset. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-center space-y-6">
        
        {/* Envelope & Blue Lock Illustration matching Screenshot Image 1, Frame 2 */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm relative">
          <Mail className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Forgot Your Password?</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter your email address and we'll send you instructions and a verification code to reset your password.
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            className="w-full py-3 rounded-xl shadow-md shadow-blue-600/20"
            isLoading={isLoading}
          >
            Send Reset Link
          </Button>
        </form>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
