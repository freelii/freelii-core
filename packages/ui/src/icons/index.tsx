import { LucideIcon } from "lucide-react";
import { ComponentType, SVGProps } from "react";

// Nucleo icons
export * from "./nucleo";

// Custom icons
export { default as ExpandingArrow } from "./expanding-arrow";

// Brand icons
export * from "./facebook";
export * from "./github";
export * from "./google";
export * from "./linkedin";
export * from "./prisma";
export * from "./product-hunt";
export * from "./raycast";
export * from "./tinybird";
export * from "./twitter";
export * from "./unsplash";
export * from "./youtube";

export * from "./loading-spinner";
export * from "./three-dots";


export type Icon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
