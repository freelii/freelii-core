import { CURRENCIES } from "../constants"

export function fromUSD(amount: number, destinationCurrency: string) {
    const destinationCurrencyRate = CURRENCIES[destinationCurrency]?.rate ?? 1
    return amount * destinationCurrencyRate
}

export function toUSD(amount: number, originCurrency: string) {
    const originCurrencyRate = CURRENCIES[originCurrency]?.rate ?? 1
    return amount / originCurrencyRate
}