'use client';

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation, clearAuthState } from '@/hooks/useAuth';
import { ClipLoader } from 'react-spinners';
import clsx from 'clsx';
import Button from '../ui/Button';
import BackLink from '../ui/BackLink';
import { toast } from '@/components/ui/Toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginForm() {
  const isCaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGIN_CAPTCHA === 'true';
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const turnstileRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');

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

  const initializeTurnstile = () => {
    if (!isCaptchaEnabled) return;
    if (!turnstileSiteKey) return;
    if (!window?.turnstile || !turnstileRef.current || turnstileWidgetIdRef.current !== null) return;

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: turnstileSiteKey,
      theme: 'light',
      callback: (token) => setCaptchaToken(token),
      'expired-callback': () => setCaptchaToken(''),
      'error-callback': () => setCaptchaToken(''),
    });
  };

  useEffect(() => {
    if (!isCaptchaEnabled) return;
    const timer = setInterval(() => {
      initializeTurnstile();
      if (turnstileWidgetIdRef.current !== null) {
        clearInterval(timer);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [isCaptchaEnabled, turnstileSiteKey]);

  useEffect(() => {
    if (!isCaptchaEnabled) return;
    if (!loginMutation.isError) return;
    setCaptchaToken('');
    if (window?.turnstile && turnstileWidgetIdRef.current !== null) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }, [isCaptchaEnabled, loginMutation.isError]);

  const onSubmit = (data) => {
    if (isCaptchaEnabled && !captchaToken) {
      toast.error('Please complete CAPTCHA before signing in.', 'CAPTCHA required');
      return;
    }

    loginMutation.mutate({ ...data, captchaToken: isCaptchaEnabled ? captchaToken : undefined });
  };

  return (
    <div className="w-full ">
      {isCaptchaEnabled && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={initializeTurnstile}
        />
      )}

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

        <div className="space-y-3 mb-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg border border-[#E5E5E5] text-[#4D4E58] font-medium hover:bg-[#faf7f4] transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.6 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.2-1.7H12z" />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg border border-[#E5E5E5] text-[#4D4E58] font-medium hover:bg-[#faf7f4] transition-all"
          >
            <svg width="18" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.37 12.28c.02 2.14 1.87 2.85 1.89 2.86-.01.05-.29 1.01-.96 2-.58.86-1.18 1.72-2.13 1.74-.94.02-1.25-.56-2.33-.56-1.09 0-1.43.54-2.31.58-.91.03-1.6-.92-2.19-1.77-1.2-1.73-2.12-4.89-.89-7.03.61-1.06 1.69-1.73 2.87-1.75.89-.02 1.74.6 2.33.6.59 0 1.68-.74 2.83-.63.48.02 1.83.19 2.7 1.46-.07.05-1.61.94-1.59 2.5zM14.87 6.1c.49-.6.82-1.43.73-2.26-.71.03-1.56.47-2.06 1.07-.45.52-.84 1.36-.73 2.16.79.06 1.58-.4 2.06-.97z" />
            </svg>
            Continue with Apple
          </button>
          <p className="text-xs text-[#86868B] text-center">Social sign-in UI is ready. Backend integration pending.</p>
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

          {isCaptchaEnabled && (
            <div className="pt-1">
              <div ref={turnstileRef} className="min-h-[66px]" />
              {!turnstileSiteKey && (
                <p className="text-xs text-red-500 mt-1">
                  CAPTCHA is not configured. Please contact support.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending || (isCaptchaEnabled && !captchaToken)}
            className={clsx(
              'w-full py-3.5 rounded-lg text-base font-medium text-white transition-all',
              loginMutation.isPending || (isCaptchaEnabled && !captchaToken)
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
