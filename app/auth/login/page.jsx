import Logo from '../../../components/ui/logo';
import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import sample from '../../../public/login-register/Sample-Box.png';

export const metadata = {
  title: 'Sign In - arcmat',
  description: 'Sign in to your arcmat account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-[#F5E9E2]">

      <div className="hidden lg:flex lg:w-6/10 flex-col items-center justify-between p-2 relative">
        <div className="w-full pl-4 pt-2">
          <Logo href="/"/>
        </div>

        <div className="flex flex-col items-center justify-start flex-1mt-5 py-8 px-8">
          <h1 className="text-4xl font-semibold text-[#4D4E58] text-center leading-[50px] max-w-[500px] mb-6">
            The marketplace where architects and brands build the future together.
          </h1>

          <p className="text-[16px] text-[#86868B] text-center leading-[24px] mb-4">
            Hundreds of Brands. One Website. Order by Midnight.
          </p>

          <div className="">
            <Image
              src={sample}
              alt="Architects and brands illustration"
              width={300}
              height={200}
              className="object-contain"
              priority
            />
          </div>

          <div className="max-w-[450px] text-center mt-4 px-4">
            <p className="text-[16px] font-semibold text-[#4D4E58] mb-1">
              We&apos;re in pilot mode.
            </p>
            <p className="text-[14px] text-[#86868B] leading-relaxed">
              During this phase, selected users get free access to premium features. Your feedback will help shape the final product.
            </p>
          </div>
        </div>
      </div>


      <div className="h-screen overflow-y-auto flex w-full lg:w-4/10 bg-white px-8 sm:px-8 justify-center no-scrollbar">
        <LoginForm />
      </div>

    </div>
  );
}