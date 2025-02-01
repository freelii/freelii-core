import { cn, CURRENCIES } from "@freelii/utils";
import Image from "next/image";

export function FlagIcon({ currencyCode, size = 16, className }: { currencyCode?: string, size?: number, className?: string }) {
    const currency = CURRENCIES[currencyCode!];
    if (!currencyCode || !currency) {
        return (
            <div
                className="rounded-full bg-gray-200"
                style={{ width: size, height: size }}
            />
        )
    }
    console.log(currency.flag)

    return (
        <Image
            src={currency.flag}
            alt={currency.name}
            width={size}
            height={size}
            className={cn("rounded-full object-cover", className)}
            style={{ width: size, height: size }}
        />
    )
}