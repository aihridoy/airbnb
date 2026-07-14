const Skeleton = ({ className = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-surface-alt ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

export default Skeleton;
