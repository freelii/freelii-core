import { CURRENCIES } from "@freelii/utils";
import Image from "next/image";

export function FlagIcon({ currencyCode, size = 16 }: { currencyCode?: string, size?: number }) {
    const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
    if (!currencyCode || !currency) {
        return (
            <div
                className="rounded-full bg-gray-200"
                style={{ width: size, height: size }}
            />
        )
    }

    return (
        <Image
            src={currency.flag}
            alt={currency.name}
            width={size}
            height={size}
            className="rounded-full object-cover"
            style={{ width: size, height: size }}
        />
    )
}