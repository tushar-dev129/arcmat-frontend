"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const BackLink = ({ href = "/", label = "Back", className, useRouterBack = false, onClick }) => {
  const router = useRouter();

  if (useRouterBack || onClick) {
    return (
      <button
        onClick={onClick || (() => router.back())}
        type="button"
        className={clsx("flex items-center gap-3 group w-fit cursor-pointer", className)}
      >
        <div className="w-[18px] h-[14px]">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7H1M1 7L7 1M1 7L7 13" stroke="#4D4E58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[15.5px] text-[#4D4E58] font-normal group-hover:underline">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={clsx("flex items-center gap-3 group w-fit", className)}
    >
      <div className="w-[18px] h-[14px]">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 7H1M1 7L7 1M1 7L7 13" stroke="#4D4E58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-[15.5px] text-[#4D4E58] font-normal group-hover:underline">
        {label}
      </span>
    </Link>
  );
};

export default BackLink;