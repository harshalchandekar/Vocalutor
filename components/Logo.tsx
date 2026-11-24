import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeMap = {
    sm: { width: 120, height: 36, className: "h-8 w-auto" },
    md: { width: 140, height: 44, className: "h-11 w-auto" },
    lg: { width: 180, height: 56, className: "h-14 w-auto" },
  };

  const { width, height, className: heightClass } = sizeMap[size];

  return (
    <div className={cn("flex items-center select-none", className)}>
      <Image
        src="/vocalutor-primary.svg"
        alt="Vocalutor — Talk to an AI tutor out loud"
        width={width}
        height={height}
        priority
        className={cn("object-contain transition-transform hover:scale-[1.02]", heightClass)}
      />
    </div>
  );
};

export default Logo;
