import clsx from "clsx"

const LoadingSpinner = ({ size = "md", color = "primary", className = "", text = null }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    white: "border-white",
    gray: "border-gray-400",
  }

  return (
    <div className={clsx("flex flex-col items-center justify-center", className)}>
      <div
        className={clsx(
          "animate-spin rounded-full border-2 border-transparent border-t-current",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      {text && <p className="mt-3 text-sm text-text-secondary animate-pulse">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
