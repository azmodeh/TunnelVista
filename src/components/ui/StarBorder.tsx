'use client';

import React from 'react';
import './StarBorder.css';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
};

const StarBorder = <T extends React.ElementType = 'div'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'div';

  return (
    <Component
      className={`star-border-container ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px`,
        ...(rest as any).style,
        '--star-color': color,
        '--speed': speed,
      } as React.CSSProperties}
    >
      <div className="border-gradient-bottom"></div>
      <div className="border-gradient-top"></div>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;