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
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, ChevronDown, Eye, EyeOff, Hammer, Info, Store, UserRound } from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';
import BackLink from '../ui/BackLink';

const PROFESSIONS = ['Architect', 'Interior Designer', 'Landscape Designer'];

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
    label: 'Professional',
    description: 'Create projects, request samples, and manage specifications.',
    role: 'architect',
    icon: BriefcaseBusiness,
    needsProfession: true,
  },
  {
    id: 'contractor',
    label: 'Contractor',
    description: 'Manage construction, request quotes, and source materials.',
    role: 'contractor',
    icon: Building2,
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
  email: z.string().email('Please enter a valid business email'),
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const registerMutation = useRegisterMutation();

  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    const matchingRole = ROLE_OPTIONS.find((role) => role.id === roleFromUrl || role.role === roleFromUrl);

    if (matchingRole) {
      setSelectedRole(matchingRole);
      if (!matchingRole.needsProfession) {
        setValue('profession', matchingRole.label);
      }
    }
  }, [searchParams, setValue]);

  const selectRole = (role) => {
    setSelectedRole(role);
    if (!role.needsProfession) {
      setValue('profession', role.label);
    }
  };

  const selectProfession = (prof) => {
    setSelectedProfession(prof);
    setValue('profession', prof);
  };

  const onSubmit = (data) => {
    if (!selectedRole) return;

    const profession = selectedRole.needsProfession ? selectedProfession : selectedRole.label;
    const assignedRole = selectedRole.role;
    const providerType = assignedRole === 'contractor' ? 'contractor' : undefined;

    const finalData = {
      ...data,
      profession: profession,
      professionalType: profession,
      providerType,
    };

    let profileUrl = finalData.profile;
    if (profileUrl && profileUrl.trim() !== '') {
      profileUrl = profileUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
      profileUrl = 'www.' + profileUrl;
    }

    registerMutation.mutate({ ...finalData, profile: profileUrl, role: assignedRole });
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
            {PROFESSIONS.map((prof, index) => {
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
                placeholder="Email or Business Email"
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
    <div className="w-full max-w-xl py-8">
      <div className="flex justify-between items-center w-full h-[76px] mb-12">
        <BackLink href="/" />
        <Button
          href="/auth/login"
          className="px-6 py-2.5 border-2 border-[#d9a88a] text-[#d9a88a] font-bold hover:bg-[#d9a88a] hover:text-white transition-all rounded-full"
        >
          Sign In
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

