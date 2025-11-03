export const AuroraCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    bg-white/10 backdrop-blur-2xl
    rounded-2xl p-6 border border-white/20
    shadow-2xl hover:shadow-cyan-500/40
    transition-all duration-300
    ${className || ''}
  `}>
    {children}
  </div>
);