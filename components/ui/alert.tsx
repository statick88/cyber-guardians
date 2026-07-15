import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

type AlertVariant = "default" | "destructive" | "success" | "warning"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const icons: Record<AlertVariant, React.ReactNode> = {
      default: <Info className="w-4 h-4" />,
      destructive: <AlertCircle className="w-4 h-4" />,
      success: <CheckCircle className="w-4 h-4" />,
      warning: <AlertCircle className="w-4 h-4" />,
    }

    const colors: Record<AlertVariant, string> = {
      default: "border-slate-700 bg-slate-800/50 text-slate-300",
      destructive: "border-rose-500/30 bg-rose-500/10 text-rose-300",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>div]:translate-y-[-3px] [&>div]:pl-10",
          colors[variant],
          className
        )}
        {...props}
      >
        {icons[variant]}
        <div className="grid gap-1 [&>p]:leading-normal">
          <AlertTitle />
          <AlertDescription />
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
