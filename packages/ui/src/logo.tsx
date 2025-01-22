import { cn } from "@freelii/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/Freelii-ribbon.png"
      alt="Freelii"
      width={64}
      height={64}
      className={cn("h-10 w-10 text-black dark:text-white", className)}
    />
  );
}
