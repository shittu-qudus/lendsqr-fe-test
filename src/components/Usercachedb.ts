
const DB_NAME = 'lendsqr_user_cache';
const DB_VERSION = 1;
const STORE_NAME = 'users';
const TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

export interface CachedUser<T> {
    id: string;
    data: T;
    cachedAt: number;
}

// ============ OPEN DB ============
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ============ GET ONE USER ============
export async function getCachedUser<T>(userId: string): Promise<CachedUser<T> | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(userId);

            request.onsuccess = () => {
                const result = request.result as CachedUser<T> | undefined;
                resolve(result ?? null);
            };
            request.onerror = () => reject(request.error);
        });
    } catch {

        return null;
    }
}

// ============ SET ONE USER ============
export async function setCachedUser<T>(userId: string, data: T): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const entry: CachedUser<T> = { id: userId, data, cachedAt: Date.now() };
            const request = store.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch {
        // Silently fail — caching is best-effort
    }
}

// ============ DELETE ONE USER ============
export async function deleteCachedUser(userId: string): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(userId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch {

    }
}

export async function clearUserCache(): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch {

    }
}


export function isCacheStale(cachedAt: number): boolean {
    return Date.now() - cachedAt > TTL_MS;
}