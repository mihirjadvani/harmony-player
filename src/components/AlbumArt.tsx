import { Music } from "lucide-react";

interface AlbumArtProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: boolean;
  spinning?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-48 h-48",
  xl: "w-72 h-72",
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 48,
  xl: 64,
};

const AlbumArt = ({ src, alt, size = "md", rounded = false, spinning = false, className = "" }: AlbumArtProps) => {
  const baseClasses = `${sizeClasses[size]} flex-shrink-0 overflow-hidden flex items-center justify-center ${
    rounded ? "rounded-full" : "rounded-lg"
  } ${spinning ? "animate-spin-slow" : ""} ${className}`;

  if (src) {
    return (
      <div className={baseClasses}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-secondary`}>
      <Music size={iconSizes[size]} className="text-muted-foreground" />
    </div>
  );
};

export default AlbumArt;
