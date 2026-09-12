import Image from "next/image"
import { cn } from "@/lib/utils"

interface SanityImageProps {
  imageData: { url?: string; _id?: string } | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

const PLACEHOLDER_URL = "/images/placeholder-machine.webp"

export function SanityImage({ imageData, alt, width, height, className, priority }: SanityImageProps) {
  const imageUrl = imageData?.url

  return (
    <Image
      src={imageUrl || PLACEHOLDER_URL}
      alt={imageUrl ? alt : `Placeholder cho ${alt}`}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      priority={priority}
    />
  )
}
