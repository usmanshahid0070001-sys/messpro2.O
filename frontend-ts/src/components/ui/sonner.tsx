import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      offset={16} // Provide a standard bottom offset, but we will override right offset via CSS
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-success" />
        ),
        info: (
          <InfoIcon className="size-5 text-info" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-warning" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-primary" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // Override sonner's default right offset to attach it flat to the screen
          right: 0,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl !rounded-r-none !rounded-l-lg !border-r-0 !p-5 !mb-2 !mr-0 w-[350px] border-l-4 group-[.toaster]:border-l-primary",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
