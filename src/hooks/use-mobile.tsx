
import * as React from "react"

// Setting a smaller breakpoint for better mobile detection
const MOBILE_BREAKPOINT = 640 // Now using sm breakpoint instead of md

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check initially
    checkMobile()
    
    // Add event listeners for resize
    window.addEventListener("resize", checkMobile)
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}
