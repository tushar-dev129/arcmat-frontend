import Logo from '../../../components/ui/logo';
import Image from 'next/image';
import material from '../../../public/login-register/Material-Box.png';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Join arcmat - Professional Registration',
  description: 'Create your free arcmat professional account',
};

export default function RegisterPage() {
  return (
    <div className="h-screen overflow-hidden flex bg-[#F5E9E2]">

      <div className="hidden lg:flex lg:w-1/2 h-screen overflow-hidden flex-col items-center justify-between py-4 relative">
        <div className="w-full pl-6 ">
          <Logo href="/" />
        </div>

        <div className="flex flex-col items-center justify-start flex-1 mt-10 py-8 px-8">

          <h1 className="text-4xl xl:text-5xl font-semibold text-[#4a5568] text-center leading-tight mb-6">
            The marketplace where architects and brands build the future together.
          </h1>

          <p className="text-lg text-[#718096] text-center mb-12">
            Hundreds of verified brands, Thousands of materials. One smart platform.
          </p>

          <div className="mb-12">
            <Image
              src={material}
              alt="Architects and brands illustration"
              width={350}
              height={300}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <div className="h-screen overflow-y-auto flex w-full lg:w-1/2 bg-white px-8 sm:px-8 justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}
