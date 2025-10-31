'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountryFlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { width: 16, height: 12 },
  md: { width: 24, height: 18 },
  lg: { width: 32, height: 24 }
};

export function CountryFlag({ code, size = 'md', className }: CountryFlagProps) {
  const countryCodeLower = code?.toLowerCase();

  const initialUrl = countryCodeLower ? `https://flagcdn.com/w40/${countryCodeLower}.png` : '';
  const fallbackUrl = countryCodeLower ? `/flags/l/${countryCodeLower}.svg` : '';
  
  const [imgSrc, setImgSrc] = useState(initialUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(initialUrl);
    setHasError(false);
  }, [code, initialUrl]);

  const { width, height } = sizes[size];
  
  const handleError = () => {
    // Only try the fallback once to prevent an error loop
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackUrl);
    }
  };

  if (!countryCodeLower) {
      return <div className={cn("bg-muted rounded-sm", className)} style={{ width, height }} />;
  }

  return (
    <img
      src={imgSrc}
      alt={`${code} flag`}
      width={width}
      height={height}
      className={cn("inline-block rounded-sm shadow-sm object-cover", className)}
      onError={handleError}
    />
  );
}