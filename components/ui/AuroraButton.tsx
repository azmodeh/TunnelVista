export const AuroraButton = ({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) => (
  <button
    className={`
      px-6 py-3 rounded-xl font-bold text-sm
      flex items-center justify-center gap-2
      transition-all duration-200 active:scale-95
      ${variant === 'primary'
        ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg'
        : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
      }
    `}
    {...props}
  >
    {children}
  </button>
);