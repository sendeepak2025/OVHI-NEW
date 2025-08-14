import React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeartLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "pulse" | "beat" | "fade";
}

const Loader: React.FC<HeartLoaderProps> = ({
  size = "md",
  className,
  text,
  variant = "beat",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const containerSizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const getAnimationClass = () => {
    switch (variant) {
      case "pulse":
        return "animate-pulse";
      case "beat":
        return "animate-[heartbeat_1.5s_ease-in-out_infinite]";
      case "fade":
        return "animate-[fade_2s_ease-in-out_infinite]";
      default:
        return "animate-[heartbeat_1.5s_ease-in-out_infinite]";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        containerSizeClasses[size],
        className
      )}
    >
      <div className="relative">
        {/* Main heart */}
        <Heart
          className={cn(
            sizeClasses[size],
            "fill-red-500 text-red-500",
            getAnimationClass()
          )}
        />

        {/* Ripple effect */}
        {variant === "beat" && (
          <>
            <div
              className={cn(
                "absolute inset-0 rounded-full border-2 border-red-500/30",
                "animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 rounded-full border border-red-500/20",
                "animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]",
                "animation-delay-1000"
              )}
            />
          </>
        )}
      </div>

      {text && (
        <p
          className={cn(
            "text-muted-foreground font-medium animate-fade-in",
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
