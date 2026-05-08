const TextArea = ({
  label, name, placeholder = '', register, error,
  required = false, rows = 4, maxLength, showCount = false, currentLength = 0, className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        {...(register ? register(name) : {})}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors resize-none
          ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
        `}
      />
      <div className="flex justify-between">
        {error && <p className="text-xs text-red-500">{error}</p>}
        {showCount && maxLength && (
          <p className="text-xs text-gray-400 ml-auto">{currentLength}/{maxLength}</p>
        )}
      </div>
    </div>
  );
};

export default TextArea;