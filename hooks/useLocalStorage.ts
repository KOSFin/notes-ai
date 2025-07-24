
import { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        // The `useState` setter (`setStoredValue`) can take a function to avoid stale state issues.
        // We wrap our logic inside it to ensure the latest state value is used.
        setStoredValue(currentValue => {
            try {
                // Determine the new value: if `value` is a function, call it with the current state,
                // otherwise, it's the new value itself.
                const valueToStore = value instanceof Function ? value(currentValue) : value;

                // Persist to localStorage. This is where the error can happen.
                window.localStorage.setItem(key, JSON.stringify(valueToStore));

                // Return the new value to update the state.
                return valueToStore;
            } catch (error) {
                console.error(error);
                if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    // Dispatch a custom event so the app can react to a full storage.
                    window.dispatchEvent(new CustomEvent('storageQuotaExceeded'));
                }
                // If saving fails, return the old value to not update the state.
                return currentValue;
            }
        });
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                try {
                    setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
                } catch (error) {
                     console.error(error);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue]);

    return [storedValue, setValue as React.Dispatch<React.SetStateAction<T>>];
}
