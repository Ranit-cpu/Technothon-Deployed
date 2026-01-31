
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={selectRef} className="relative" {...props}>
      {children({ isOpen, setIsOpen, value, onValueChange })}
    </div>
  )
}

const SelectTrigger = ({ className, children, isOpen, setIsOpen, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
    </button>
  )
}

const SelectValue = ({ placeholder, value }) => {
  return <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>
}

const SelectContent = ({ className, children, isOpen, ...props }) => {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute top-full left-0 z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-2xl",
        className,
      )}
      style={{
        zIndex: 9999,
        position: "absolute",
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
      {...props}
    >
      {children}
    </div>
  )
}

const SelectItem = ({ className, children, value, onValueChange, setIsOpen, ...props }) => {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-white/10 focus:bg-white/10 transition-colors",
        className,
      )}
      onClick={() => {
        onValueChange(value)
        setIsOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// Export all components
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
