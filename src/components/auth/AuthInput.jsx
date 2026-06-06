import { Eye, EyeOff } from 'lucide-react'

const AuthInput = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
  required = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  hint,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-300 mb-2"
      >
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 group-focus-within:text-accent transition-colors pointer-events-none" />
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={type === 'password' ? 'current-password' : name === 'email' ? 'email' : 'off'}
          className={`auth-input w-full pl-11 py-3.5 ${showPasswordToggle ? 'pr-12' : 'pr-4'} disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
      {hint && (
        <p className="text-xs text-slate-500 mt-1.5">{hint}</p>
      )}
    </div>
  )
}

export default AuthInput
