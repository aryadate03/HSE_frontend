const Loader = ({ size = 'md', fullscreen = false, text = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-2 border-[#4f63ff] border-t-transparent animate-spin`}
      />
      {text && <p className="text-sm text-[#8892a4]">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#0d1117' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;