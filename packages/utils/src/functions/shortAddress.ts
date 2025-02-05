export function shortAddress(address?: string | null | undefined) {
    if (!address) return '';
    return address.slice(0, 4) + '...' + address.slice(-4);
}