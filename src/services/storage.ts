export function getLocalStorage(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
}

export function setLocalStorage(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
}

export function clearLocalStorage(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
}

export function clearAllLocalStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
}
