import { useEffect, useCallback, useRef } from 'react'

export function useDataLoader(loadFunction: () => void) {
    const lastLoadTime = useRef<number>(0)
    const isLoading = useRef<boolean>(false)
    const DEBOUNCE_DELAY = 2000 // 2 seconds minimum between loads

    const handleDataLoad = useCallback(() => {
        const now = Date.now()

        // Prevent excessive calls
        if (isLoading.current || (now - lastLoadTime.current) < DEBOUNCE_DELAY) {
            return
        }

        isLoading.current = true
        lastLoadTime.current = now

        loadFunction()

        // Reset loading flag after a delay
        setTimeout(() => {
            isLoading.current = false
        }, 1000)
    }, [loadFunction])

    useEffect(() => {
        // Load data on mount only
        handleDataLoad()

        // Only reload on visibility change (when tab becomes visible)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Small delay to ensure page is fully loaded
                setTimeout(handleDataLoad, 500)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [handleDataLoad])

    return handleDataLoad
} 