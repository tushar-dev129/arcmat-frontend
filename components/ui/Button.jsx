import Link from 'next/link';
import React from 'react';

const Button = ({ text, onClick, className, children, href, isLoading, loading, ...rest }) => {
  if (href) {
    return (
      <Link
        href={href}
        className={`rounded-full inline-flex duration-200 items-center whitespace-nowrap justify-center ${className}`}
      >
        {children}
        {text}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`rounded-full transition duration-200 whitespace-nowrap font-normal ${className}`}
      disabled={isLoading || loading || rest.disabled}
      {...rest}
    >
      {children}
      {text}
    </button>
  );
};

export default Button;
