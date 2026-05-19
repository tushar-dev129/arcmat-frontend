'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '@/hooks/useAuth';
import Link from 'next/link';
import { ClipLoader } from 'react-spinners';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, ChevronDown, Eye, EyeOff, Hammer, HardHat, Info, Mail, Phone, Store, UserRound } from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import BackLink from '../ui/BackLink';

const DESIGNER_PROFESSIONS = ['Architect', 'Interior Designer', 'Landscape Designer'];


const ROLE_OPTIONS = [
  {
    id: 'customer',
    label: 'User',
    description: 'Browse materials, save favourites, and collaborate on projects.',
    role: 'customer',
    icon: UserRound,
  },
  {
    id: 'professional',
    label: 'Designer',
    description: 'Create projects, request samples, and manage specifications.',
    role: 'architect',
    icon: BriefcaseBusiness,
    needsProfession: true,
    professions: DESIGNER_PROFESSIONS,
  },
  {
    id: 'contractor',
    label: 'Contractor',
    description: 'Provide construction and building services for projects.',
    role: 'contractor',
    professionalType: 'Contractor / Builder',
    icon: HardHat,
  },
  {
    id: 'brand',
    label: 'Brand',
    description: 'Showcase catalogues and connect with design professionals.',
    role: 'brand',
    icon: Building2,
  },
  {
    id: 'retailer',
    label: 'Retailer',
    description: 'Manage availability, inventory, and local material support.',
    role: 'retailer',
    icon: Store,
  },
  {
    id: 'custom_maker',
    label: 'Custom Maker',
    description: 'Register as a bespoke maker for custom project work.',
    role: 'custom_maker',
    icon: Hammer,
  },
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().length(10, 'Mobile number must be exactly 10 digits').regex(/^\d+$/, 'Mobile number must contain only digits'),
  email: z.string().email('Please enter a valid business email').optional().or(z.literal('')),
  city: z.string().min(2, 'City must be at least 2 characters'),
  profession: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  profile: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState(null);
  // Holds pending registration data when both email+mobile provided
  const [otpChoiceData, setOtpChoiceData] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      profession: '',
    },
  });

  const registerMutation = useRegisterMutation();

  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    const matchingRole = ROLE_OPTIONS.find((role) => role.id === roleFromUrl || role.role === roleFromUrl);

    if (matchingRole) {
      setSelectedRole(matchingRole);
      if (!matchingRole.needsProfession) {
        setValue('profession', matchingRole.label);
      } else {
        setValue('profession', '');
      }
    }
  }, [searchParams, setValue]);

  const selectRole = (role) => {
    setSelectedRole(role);
    if (!role.needsProfession) {
      setValue('profession', role.label);
    } else {
      setValue('profession', '');
    }
  };

  const selectProfession = (prof) => {
    setSelectedProfession(prof);
    setValue('profession', prof);
  };

  const buildFinalData = (data) => {
    const prof = selectedRole.needsProfession ? data.profession : selectedRole.professionalType;
    const assignedRole = selectedRole.role;
    const providerType = assignedRole === 'contractor' ? 'contractor' : undefined;
    let profileUrl = data.profile;
    if (profileUrl && profileUrl.trim() !== '') {
      profileUrl = profileUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
      profileUrl = 'www.' + profileUrl;
    }
    return {
      ...data,
      profession: prof,
      professionalType: prof,
      providerType,
      profile: profileUrl,
      role: assignedRole,
    };
  };

  const onSubmit = (data) => {
    if (!selectedRole) return;
    if (selectedRole.needsProfession && !data.profession) {
      setError('profession', { type: 'manual', message: 'Please select a profession' });
      return;
    }
    clearErrors('profession');

    const finalData = buildFinalData(data);
    const hasEmail = !!(data.email && data.email.trim());

    // If both mobile AND email provided, show choice dialog
    if (hasEmail && data.mobile) {
      setOtpChoiceData(finalData);
      return;
    }

    // Only mobile — default to mobile OTP
    registerMutation.mutate({ ...finalData, sendOtpTo: 'mobile' });
  };

  const submitWithOtpChoice = (sendOtpTo) => {
    if (!otpChoiceData) return;
    setOtpChoiceData(null);
    registerMutation.mutate({ ...otpChoiceData, sendOtpTo });
  };

  // Helper to determine what to render
  const renderContent = () => {
    // Step 1: Role Selection
    if (!selectedRole) {
      return (
        <motion.div
          key="role-selection"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="pb-8"
        >
          <div className="mb-8 px-0 sm:px-10">
            <h2 className="text-3xl font-bold text-[#2d3748] mb-3">
              Choose your role
            </h2>
            <p className="text-[#718096] text-lg leading-relaxed">
              Select how you want to join Arcmat. We'll tailor your experience based on your role.
            </p>
          </div>

          <div className="grid gap-4 px-0 sm:px-10">
            {ROLE_OPTIONS.map((role, index) => {
              const Icon = role.icon;

              return (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center gap-5 rounded-2xl border border-[#eadbd2] bg-white/50 backdrop-blur-sm p-5 text-left shadow-sm transition-all hover:border-[#d9a88a] hover:bg-white hover:shadow-xl"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f5f0eb] text-[#c99775] transition-all group-hover:bg-[#d9a88a] group-hover:text-white group-hover:rotate-3">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-[#2d3748]">
                      {role.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-[#718096]">
                      {role.description}
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#c99775] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </motion.button>
              );
            })}
            

          </div>

           <div className="flex items-center gap-1 text-[15.6px] text-[#4D4E58]">
            <span>Already have an account?</span>
            <Link href="/auth/login" className="underline decoration-1 text-primary/80 underline-offset-2 hover:text-primary">
              Login
            </Link>
          </div>
        </motion.div>
      );
    }

    // Step 2: Profession Selection (Only for Professional role)
    if (selectedRole.needsProfession && !selectedProfession) {
      return (
        <motion.div
          key="profession-selection"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="pb-8"
        >
          <div className="mb-8 px-0 sm:px-10">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#718096] transition-colors hover:text-[#d9a88a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to roles
            </button>
            <h2 className="text-3xl font-bold text-[#2d3748] mb-3">
              What is your profession?
            </h2>
            <p className="text-[#718096] text-lg leading-relaxed">
              Help us understand your background to provide relevant tools and samples.
            </p>
          </div>

          <div className="grid gap-4 px-0 sm:px-10">
            {(selectedRole.professions || []).map((prof, index) => {
              // Map icons to professions
              const Icon = prof.includes('Architect') ? BriefcaseBusiness :
                prof.includes('Interior') ? UserRound : Hammer;

              return (
                <motion.button
                  key={prof}
                  type="button"
                  onClick={() => selectProfession(prof)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center gap-5 rounded-2xl border border-[#eadbd2] bg-white/50 backdrop-blur-sm p-5 text-left shadow-sm transition-all hover:border-[#d9a88a] hover:bg-white hover:shadow-xl"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f5f0eb] text-[#c99775] transition-all group-hover:bg-[#d9a88a] group-hover:text-white group-hover:rotate-3">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-[#2d3748]">
                      {prof}
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#c99775] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      );
    }

    // Step 3: Registration Form
    return (
      <motion.div
        key="register-form"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-8 px-0 sm:px-10">
          <button
            type="button"
            onClick={() => {
              if (selectedRole.needsProfession) {
                setSelectedProfession(null);
              } else {
                setSelectedRole(null);
              }
            }}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#718096] transition-colors hover:text-[#d9a88a]"
          >
            <ArrowLeft className="h-4 w-4" />
            {selectedRole.needsProfession ? 'Change profession' : 'Change role'}
          </button>
          <h2 className="text-3xl font-bold text-[#2d3748] mb-3 leading-tight">
            Join as {selectedRole.needsProfession
              ? `${['A', 'E', 'I', 'O', 'u'].includes(selectedProfession?.[0]) ? 'an' : 'a'} ${selectedProfession}`
              : `a ${selectedRole.label}`}
          </h2>
          <p className="text-[#718096] text-lg">
            {selectedRole.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-0 sm:px-10 pb-12">
          <div className="grid gap-5">
            <div className="relative group">
              <input
                type="text"
                placeholder="Full Name"
                {...register('name')}
                className={clsx(
                  'w-full px-5 py-4 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                  errors.name ? 'border-red-500' : 'border-[#e2e8f0]'
                )}
              />
              {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name.message}</p>}
            </div>

            <div className="relative group">
              <input
                type="tel"
                placeholder="Mobile Number"
                maxLength="10"
                {...register('mobile')}
                className={clsx(
                  'w-full px-5 py-4 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                  errors.mobile ? 'border-red-500' : 'border-[#e2e8f0]'
                )}
              />
              {errors.mobile && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.mobile.message}</p>}
            </div>

            <div className="relative group">
              <input
                type="email"
                placeholder="Email (Optional)"
                {...register('email')}
                className={clsx(
                  'w-full px-5 py-4 pr-12 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                  errors.email ? 'border-red-500' : 'border-[#e2e8f0]'
                )}
              />
              <Info className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0aec0] opacity-50" />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="City / Address"
                {...register('city')}
                className={clsx(
                  'w-full px-5 py-4 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                  errors.city ? 'border-red-500' : 'border-[#e2e8f0]'
                )}
              />
              {errors.city && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.city.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  {...register('password')}
                  className={clsx(
                    'w-full px-5 py-4 pr-12 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                    errors.password ? 'border-red-500' : 'border-[#e2e8f0]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-[#d9a88a] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
              </div>

              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  {...register('confirmPassword')}
                  className={clsx(
                    'w-full px-5 py-4 pr-12 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                    errors.confirmPassword ? 'border-red-500' : 'border-[#e2e8f0]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-[#d9a88a] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="LinkedIn / Portfolio URL"
                {...register('profile')}
                className={clsx(
                  'w-full px-5 py-4 border rounded-xl text-base text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a]/50 focus:border-[#d9a88a] transition-all bg-white/50 group-hover:bg-white',
                  errors.profile ? 'border-red-500' : 'border-[#e2e8f0]'
                )}
              />
              {errors.profile && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.profile.message}</p>}
            </div>
          </div>

          <div className="pt-4 space-y-6">
            <p className="text-sm text-[#718096] leading-relaxed">
              By Clicking "Create Account", You Agree to{' '}
              <Link href="/terms" className="text-[#2d3748] font-semibold underline hover:text-[#d9a88a] transition-colors">Our Terms of Use</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#2d3748] font-semibold underline hover:text-[#d9a88a] transition-colors">Privacy Notice</Link>.
              <br />
              <a href="/Arcmat PDF/Arcmat – Design-Stage Material Specification Framework (1).pdf" download className="inline-flex items-center gap-1.5 mt-2 text-[#d9a88a] font-medium hover:underline">
                Download Arcmat Framework PDF
              </a>
            </p>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className={clsx(
                'w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all transform active:scale-[0.98]',
                registerMutation.isPending
                  ? 'bg-[#d9a88a]/70 cursor-not-allowed'
                  : 'bg-[#d9a88a] hover:bg-[#c99775] hover:shadow-[#d9a88a]/20 hover:shadow-2xl'
              )}
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <ClipLoader size={20} color="#ffffff" />
                  <span>Processing...</span>
                </span>
              ) : (
                `Create ${selectedRole.needsProfession ? selectedProfession : selectedRole.label} Account`
              )}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-full pt-10 pb-8">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pb-8"
          >
            <div className="mb-7 px-0 sm:px-10">
              <h2 className="text-3xl font-semibold text-[#4a5568] mb-2">
                Choose your role
              </h2>
              <p className="text-[#718096] text-base">
                Select how you want to join Arcmat. The next screen keeps the same signup form and carries your role with it.
              </p>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 px-0 sm:px-10">
              {ROLE_OPTIONS.map((role, index) => {
                const Icon = role.icon;

                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => selectRole(role)}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24, delay: index * 0.05, ease: 'easeOut' }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="group flex w-full items-start gap-4 rounded-lg border border-[#eadbd2] bg-white p-4 text-left shadow-sm transition-all hover:border-[#d9a88a] hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f5f0eb] text-[#c99775] transition-colors group-hover:bg-[#d9a88a] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-[#4a5568]">
                        {role.label}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-[#718096]">
                        {role.description}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-[#c99775] transition-transform group-hover:translate-x-1" />
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 text-center text-[15px] text-[#4d4e58] px-0 sm:px-10">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-[#d9a88a] hover:text-[#c99775] underline">
                Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mb-8 px-0 sm:px-10">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#718096] transition-colors hover:text-[#4a5568]"
              >
                <ArrowLeft className="h-4 w-4" />
                Change role
              </button>
              <h2 className="text-3xl font-semibold text-[#4a5568] mb-2 md:whitespace-nowrap">
                Join as a {selectedRole.label}
              </h2>
              <p className="text-[#718096] text-base">
                {selectedRole.description}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-0 sm:px-10 pb-8">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register('name')}
                  className={clsx(
                    'w-full px-4 py-3.5 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                    errors.name ? 'border-red-500' : 'border-[#e2e8f0]'
                  )}
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  maxLength="10"
                  {...register('mobile')}
                  className={clsx(
                    'w-full px-4 py-3.5 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                    errors.mobile ? 'border-red-500' : 'border-[#e2e8f0]'
                  )}
                />
                {errors.mobile && <p className="mt-1.5 text-sm text-red-500">{errors.mobile.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    {...register('email')}
                    className={clsx(
                      'w-full px-4 py-3.5 pr-12 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                      errors.email ? 'border-red-500' : 'border-[#e2e8f0]'
                    )}
                  />
                  <Info className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0aec0]" />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {selectedRole.needsProfession && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <select
                      {...register('profession')}
                      className={clsx(
                        'w-full px-4 py-3.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all appearance-none bg-white cursor-pointer',
                        errors.profession ? 'border-red-500' : 'border-[#e2e8f0]',
                        watch('profession') ? 'text-[#4a5568]' : 'text-[#a0aec0]'
                      )}
                    >
                      <option value="" disabled>Select Profession</option>
                      {(selectedRole.professions || []).map((prof) => (
                        <option key={prof} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718096] pointer-events-none group-hover:text-[#d9a88a] transition-colors" />
                  </div>
                  {errors.profession && <p className="mt-1.5 text-sm text-red-500">{errors.profession.message}</p>}
                </motion.div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="City / Address"
                  {...register('city')}
                  className={clsx(
                    'w-full px-4 py-3.5 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                    errors.city ? 'border-red-500' : 'border-[#e2e8f0]'
                  )}
                />
                {errors.city && <p className="mt-1.5 text-sm text-red-500">{errors.city.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...register('password')}
                      className={clsx(
                        'w-full px-4 py-3.5 pr-12 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                        errors.password ? 'border-red-500' : 'border-[#e2e8f0]'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-[#718096] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      {...register('confirmPassword')}
                      className={clsx(
                        'w-full px-4 py-3.5 pr-12 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                        errors.confirmPassword ? 'border-red-500' : 'border-[#e2e8f0]'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-[#718096] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="LinkedIn / Portfolio URL"
                  {...register('profile')}
                  className={clsx(
                    'w-full px-4 py-3.5 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                    errors.profile ? 'border-red-500' : 'border-[#e2e8f0]'
                  )}
                />
                {errors.profile && <p className="mt-1.5 text-sm text-red-500">{errors.profile.message}</p>}
              </div>

              <p className="text-sm text-[#718096]">
                By Clicking "Create Account", You Agree to{' '}
                <Link href="/terms" className="text-[#4a5568] underline hover:text-[#2d3748]">Our Terms of Use</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#4a5568] underline hover:text-[#2d3748]">Privacy Notice</Link>.
                {' '}Arcmat profile <a href="/Arcmat PDF/Arcmat – Design-Stage Material Specification Framework (1).pdf" download="Arcmat_Design_Stage_Material_Specification_Framework.pdf" className="text-black underline">Download here</a>
              </p>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className={clsx(
                  'w-full py-3.5 rounded-lg text-base font-medium text-white transition-all',
                  registerMutation.isPending ? 'bg-[#d9a88a]/70 cursor-not-allowed' : 'bg-[#d9a88a] hover:bg-[#c99775]'
                )}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClipLoader size={18} color="#ffffff" />
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  `Create Account`
                )}
              </button>

              <div className="mt-6 text-center text-[15px] text-[#4d4e58]">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-[#d9a88a] hover:text-[#c99775] underline">
                  Sign In
                </Link>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Destination Choice Overlay */}
      <AnimatePresence>
        {otpChoiceData && (
          <motion.div
            key="otp-choice-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-[#fef7f2] to-[#f5f0eb] px-8 pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm mb-4">
                  <svg className="w-7 h-7 text-[#d9a88a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#2d3748] mb-1">Verify Your Account</h3>
                <p className="text-[#718096] text-sm leading-relaxed">
                  Where should we send your 6-digit verification code?
                </p>
              </div>

              {/* Options */}
              <div className="p-6 space-y-3">
                {/* Mobile Option */}
                <motion.button
                  type="button"
                  onClick={() => submitWithOtpChoice('mobile')}
                  disabled={registerMutation.isPending}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#eadbd2] bg-white hover:border-[#d9a88a] hover:bg-[#fef7f2] transition-all duration-200 text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#f5f0eb] text-[#d9a88a] group-hover:bg-[#d9a88a] group-hover:text-white transition-all duration-200">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#2d3748] text-sm">Send to Mobile Number</p>
                    <p className="text-[#718096] text-xs mt-0.5 truncate">+91 {otpChoiceData?.mobile}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#c99775] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                </motion.button>

                {/* Email Option */}
                <motion.button
                  type="button"
                  onClick={() => submitWithOtpChoice('email')}
                  disabled={registerMutation.isPending}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#eadbd2] bg-white hover:border-sky-400 hover:bg-sky-50 transition-all duration-200 text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#2d3748] text-sm">Send to Email Address</p>
                    <p className="text-[#718096] text-xs mt-0.5 truncate">{otpChoiceData?.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                </motion.button>
              </div>

              {/* Cancel */}
              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={() => setOtpChoiceData(null)}
                  disabled={registerMutation.isPending}
                  className="w-full py-2.5 text-sm text-[#718096] hover:text-[#4a5568] transition-colors font-medium"
                >
                  ← Go back and edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

