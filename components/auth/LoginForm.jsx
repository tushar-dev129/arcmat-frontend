'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation, clearAuthState } from '@/hooks/useAuth';
import { ClipLoader } from 'react-spinners';
import clsx from 'clsx';
import Button from '../ui/Button';
import BackLink from '../ui/BackLink';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginForm() {
  useEffect(() => {
    clearAuthState();
  }, []);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full ">

      <div className="flex justify-between items-center w-full h-[76px] mb-[60px]">
        <BackLink href="/" />
        <Button href="/auth/register">
          Join for free
        </Button>
      </div>

      <div className="w-full  mx-auto flex flex-col flex-1 px-0 sm:px-10 pb-8">

        <div className="mb-8">
          <h2 className="text-[36px] font-semibold text-[#4D4E58] leading-[40px] mb-2">
            Sign In
          </h2>
          <div className="flex items-center gap-1 text-[15.6px] text-[#4D4E58]">
            <span>Not a registered user?</span>
            <Link href="/auth/register" className="underline decoration-1 text-primary/80 underline-offset-2 hover:text-primary">
              Register
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-col w-full flex gap-3">

          <div className="relative">
            <input
              {...register('email')}
              type="email"
              placeholder="Business Email"
              className={clsx(
                "w-full py-3 rounded-[8px] border px-4 text-[15.75px] text-[#4D4E58] placeholder-[#86868B] focus:outline-none focus:border-primary transition-all",
                errors.email ? "border-red-500" : "border-[#E5E5E5]"
              )}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1 absolute -bottom-6 left-0">{errors.email.message}</span>}
          </div>

          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={clsx(
                "w-full py-3 rounded-[8px] border px-4 text-[15.75px] text-[#4D4E58] placeholder-[#86868B] focus:outline-none focus:border-primary transition-all",
                errors.password ? "border-red-500" : "border-[#E5E5E5]"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
            >
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
                </svg>
              )}
            </button>
            {errors.password && <span className="text-red-500 text-sm mt-1 absolute -bottom-6 left-0">{errors.password.message}</span>}
          </div>

          <div className=" pt-2">
            <p className="text-[12px] text-[#4D4E58]">
              By Clicking "Sign In", You Agree to <Link href="/terms" className="text-black underline">Our Terms of Use</Link> and <Link href="/privacy" className="text-black underline">Privacy Notice</Link>.
              {' '}Arcmat profile <a href="/Arcmat PDF/Arcmat – Design-Stage Material Specification Framework (1).pdf" download="Arcmat_Design_Stage_Material_Specification_Framework.pdf" className="text-black underline">Download here</a>
            </p>
          </div>

          <div className="flex justify-end ">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#d9a88a] hover:text-[#c99775] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={clsx(
              'w-full py-3.5 rounded-lg text-base font-medium text-white transition-all',
              loginMutation.isPending
                ? "bg-primary/70 cursor-not-allowed"
                : "bg-primary hover:bg-[#d48b65]"
            )}
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <ClipLoader size={18} color="#fff" />
                <span>Signing In...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}