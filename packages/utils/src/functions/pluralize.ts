export function pluralize(count: number, word: string, customPlural?: string) {
    return count === 1 ? word : customPlural || `${word}s`
}