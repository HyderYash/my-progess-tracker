export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString().split('T')[0]
}

export function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
}

export function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
}

export function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function getAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((a, b) => a + b, 0)
    return Math.round((sum / ratings.length) * 10) / 10
}

export function getRatingColor(rating: number): string {
    if (rating >= 4) return '#10b981' // Green
    if (rating >= 3) return '#f59e0b' // Yellow
    if (rating >= 2) return '#f97316' // Orange
    return '#ef4444' // Red
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
} 