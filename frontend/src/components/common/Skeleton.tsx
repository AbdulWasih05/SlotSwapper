// Utility function to conditionally join class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'custom';
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({
  className,
  variant = 'custom',
  width,
  height,
  rounded = 'lg',
}: SkeletonProps) {
  const baseClasses = 'skeleton animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]';

  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/5',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-40 w-full',
    button: 'h-10 w-24',
    custom: '',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        variant !== 'avatar' && roundedClasses[rounded],
        className
      )}
      style={style}
    />
  );
}

// Skeleton Card Component for Marketplace/Dashboard
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="avatar" />
          <div className="space-y-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton width={70} height={24} rounded="full" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Skeleton variant="button" className="w-full" height={40} />
      </div>
    </div>
  );
}

// Skeleton for stats cards in Dashboard
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={36} />
        </div>
        <Skeleton width={48} height={48} rounded="lg" />
      </div>
      <div className="mt-4">
        <Skeleton width={100} height={16} />
      </div>
    </div>
  );
}

// Skeleton for list items
export function SkeletonListItem() {
  return (
    <div className="border-l-4 border-slate-200 pl-4 py-3 bg-slate-50 rounded-r-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} />
        </div>
        <Skeleton width={60} height={24} rounded="full" />
      </div>
    </div>
  );
}

// Skeleton for request cards
export function SkeletonRequestCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Skeleton width={20} height={20} rounded="full" />
          <Skeleton width={120} height={18} />
        </div>
        <Skeleton width={80} height={14} />
      </div>
      <Skeleton width={80} height={24} rounded="full" className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
          <Skeleton width="80%" height={16} className="mb-2" />
          <Skeleton width="60%" height={12} className="mb-1" />
          <Skeleton width="50%" height={12} />
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <Skeleton width="80%" height={16} className="mb-2" />
          <Skeleton width="60%" height={12} className="mb-1" />
          <Skeleton width="50%" height={12} />
        </div>
      </div>

      <div className="flex space-x-3">
        <Skeleton height={40} className="flex-1" />
        <Skeleton height={40} className="flex-1" />
      </div>
    </div>
  );
}

export default Skeleton;
