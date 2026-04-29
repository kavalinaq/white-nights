interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-24 h-24 text-3xl',
};

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const base = `${sizes[size]} rounded-full flex-shrink-0 ${className}`;
  const initials = name.replace(/^@/, '').slice(0, 2).toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={`${base} object-cover`} />;
  }
  return (
    <div className={`${base} bg-[#e8e2d9] flex items-center justify-center font-semibold text-[#7a6f68]`}>
      {initials}
    </div>
  );
}
