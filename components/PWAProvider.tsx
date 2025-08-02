'use client'

import { useEffect, useState } from 'react'

export function PWAProvider() {
    const [isInstalled, setIsInstalled] = useState(false)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration)

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available
                                    console.log('New content is available')
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })
        }

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstallPrompt(true)
        })

        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            console.log('PWA was installed')
        })

        // Check notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission)
        }
    }, [])

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications')
            return
        }

        try {
            const permission = await Notification.requestPermission()
            setNotificationPermission(permission)

            if (permission === 'granted') {
                console.log('Notification permission granted')
                // Subscribe to push notifications if service worker is ready
                if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                    const registration = await navigator.serviceWorker.ready
                    // You can add push subscription here if you have a push server
                    console.log('Ready for push notifications')
                }
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error)
        }
    }

    const sendTestNotification = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications')
            return
        }

        if (Notification.permission !== 'granted') {
            alert('Please grant notification permission first')
            return
        }

        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                const registration = await navigator.serviceWorker.ready
                await registration.showNotification('Progress Tracker', {
                    body: 'This is a test notification! 🎉',
                    icon: '/icon-192x192.png',
                    tag: 'test-notification',
                    requireInteraction: true
                })
                console.log('Test notification sent')
            } else {
                // Fallback to regular notification
                new Notification('Progress Tracker', {
                    body: 'This is a test notification! 🎉',
                    icon: '/icon-192x192.png'
                })
            }
        } catch (error) {
            console.error('Error sending test notification:', error)
            alert('Failed to send test notification')
        }
    }

    const installApp = async () => {
        if (!deferredPrompt) {
            alert('Install prompt not available')
            return
        }

        try {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt')
            } else {
                console.log('User dismissed the install prompt')
            }

            setDeferredPrompt(null)
            setShowInstallPrompt(false)
        } catch (error) {
            console.error('Error installing app:', error)
            alert('Failed to install app')
        }
    }

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {/* Install Prompt */}
            {showInstallPrompt && !isInstalled && (
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #0d9488)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    marginBottom: '10px',
                    maxWidth: '300px',
                    animation: 'slideInUp 0.3s ease-out'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>📱 Install App</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', opacity: 0.9 }}>
                        Install Progress Tracker for a better experience
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={installApp}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                flex: 1
                            }}
                        >
                            Install
                        </button>
                        <button
                            onClick={() => setShowInstallPrompt(false)}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Later
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Controls */}
            <div style={{
                background: 'rgba(30, 30, 46, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                maxWidth: '300px'
            }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>🔔 Notifications</h4>

                {notificationPermission === 'default' && (
                    <button
                        onClick={requestNotificationPermission}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #0d9488)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            width: '100%',
                            marginBottom: '0.5rem'
                        }}
                    >
                        Enable Notifications
                    </button>
                )}

                {notificationPermission === 'granted' && (
                    <button
                        onClick={sendTestNotification}
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            width: '100%',
                            marginBottom: '0.5rem'
                        }}
                    >
                        🧪 Test Notification
                    </button>
                )}

                {notificationPermission === 'denied' && (
                    <p style={{ margin: '0', fontSize: '0.875rem', opacity: 0.7 }}>
                        Notifications are blocked. Please enable them in your browser settings.
                    </p>
                )}

                <p style={{ margin: '0', fontSize: '0.75rem', opacity: 0.6 }}>
                    Status: {notificationPermission}
                </p>
            </div>

            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
} 