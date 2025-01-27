export function maskFirstDigits(accountNumber: string, maskLength: number = 4) {
    return `${Array.from({ length: accountNumber.length - maskLength }, () => '•').join('')}${accountNumber.slice(-maskLength)}`;
}
