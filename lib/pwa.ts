export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('SW registered: ', registration)
            return registration
        } catch (registrationError) {
            console.log('SW registration failed: ', registrationError)
        }
    }
}

export async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }
    return false
}

export async function scheduleDailyReminder() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date()
        const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0) // 8 PM

        if (now > reminderTime) {
            reminderTime.setDate(reminderTime.getDate() + 1)
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime()

        setTimeout(() => {
            new Notification('Daily Progress Tracker', {
                body: 'Time to fill out your daily tracker!',
                icon: '/icon-192x192.png',
                tag: 'daily-reminder'
            })
        }, timeUntilReminder)
    }
}

export async function showInstallPrompt() {
    let deferredPrompt: any

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt = e
        // Show install button
        const installButton = document.getElementById('install-button')
        if (installButton) {
            installButton.style.display = 'block'
        }
    })

    return deferredPrompt
}

export function installApp() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt()
        window.deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt')
            }
            window.deferredPrompt = null
        })
    }
}

declare global {
    interface Window {
        deferredPrompt: any
    }
} 