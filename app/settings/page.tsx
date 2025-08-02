'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Settings {
    notifications: {
        enabled: boolean
        time: string
        frequency: 'daily' | 'weekly'
    }
    theme: 'dark' | 'light'
    autoSave: boolean
}

export default function Settings() {
    const [settings, setSettings] = useState<Settings>({
        notifications: {
            enabled: false,
            time: '20:00',
            frequency: 'daily'
        },
        theme: 'dark',
        autoSave: true
    })

    // Loading states
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const loadSettings = async () => {
        setIsLoading(true)
        try {
            const savedSettings = localStorage.getItem('settings')
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings))
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Use custom hook for reliable data loading
    useEffect(() => {
        loadSettings()
    }, [])

    const saveSettings = async (newSettings: Settings) => {
        setIsSaving(true)
        try {
            localStorage.setItem('app-settings', JSON.stringify(newSettings))
            setSettings(newSettings)

            // Request notification permission if enabled
            if (newSettings.notifications.enabled) {
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission()
                    if (permission !== 'granted') {
                        alert('Notification permission denied. Please enable notifications in your browser settings.')
                    }
                }
            }
        } catch (error) {
            console.error('Error saving settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleNotificationToggle = (enabled: boolean) => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                enabled
            }
        }
        saveSettings(newSettings)
    }

    const handleNotificationTimeChange = (time: string) => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                time
            }
        }
        saveSettings(newSettings)
    }

    const handleNotificationFrequencyChange = (frequency: 'daily' | 'weekly') => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                frequency
            }
        }
        saveSettings(newSettings)
    }

    const handleThemeChange = (theme: 'dark' | 'light') => {
        const newSettings = {
            ...settings,
            theme
        }
        saveSettings(newSettings)
    }

    const handleAutoSaveToggle = (autoSave: boolean) => {
        const newSettings = {
            ...settings,
            autoSave
        }
        saveSettings(newSettings)
    }

    const exportData = () => {
        try {
            const data = {
                tasks: localStorage.getItem('tasks'),
                entries: Object.keys(localStorage)
                    .filter(key => key.startsWith('daily-entry-'))
                    .reduce((obj, key) => {
                        obj[key] = localStorage.getItem(key)
                        return obj
                    }, {} as Record<string, string | null>),
                settings: localStorage.getItem('app-settings')
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `progress-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error exporting data:', error)
            alert('Error exporting data')
        }
    }

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string)

                // Restore data
                if (data.tasks) localStorage.setItem('tasks', data.tasks)
                if (data.entries) {
                    Object.entries(data.entries).forEach(([key, value]) => {
                        if (value) localStorage.setItem(key, value as string)
                    })
                }
                if (data.settings) localStorage.setItem('app-settings', data.settings)

                // Reload settings
                loadSettings()
                alert('Data imported successfully!')
            } catch (error) {
                console.error('Error importing data:', error)
                alert('Error importing data. Please check the file format.')
            }
        }
        reader.readAsText(file)
    }

    const clearData = () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                // Clear all app data
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('daily-entry-') || key === 'tasks' || key === 'app-settings') {
                        localStorage.removeItem(key)
                    }
                })
                alert('All data cleared successfully!')
                loadSettings()
            } catch (error) {
                console.error('Error clearing data:', error)
                alert('Error clearing data')
            }
        }
    }

    if (isLoading) {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="loading">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <header>
                <div className="container">
                    <div className="header-content">
                        <h1 className="gradient-text">Settings</h1>
                        <p>Customize your app experience</p>
                        <nav>
                            <Link href="/" className="nav-link">Dashboard</Link>
                            <Link href="/calendar" className="nav-link">Calendar</Link>
                            <Link href="/reports" className="nav-link">Reports</Link>
                            <Link href="/settings" className="nav-link active">Settings</Link>
                            <button
                                onClick={loadSettings}
                                className="btn btn-outline"
                                style={{ marginLeft: '10px' }}
                            >
                                🔄 Refresh
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                {/* Notifications */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Notifications
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Enable Notifications</span>
                            <button
                                onClick={() => handleNotificationToggle(!settings.notifications.enabled)}
                                style={{
                                    width: '3rem',
                                    height: '1.5rem',
                                    borderRadius: '1rem',
                                    background: settings.notifications.enabled ? '#8b5cf6' : 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '1.25rem',
                                    height: '1.25rem',
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    position: 'absolute',
                                    top: '0.125rem',
                                    left: settings.notifications.enabled ? '1.625rem' : '0.125rem',
                                    transition: 'left 0.3s ease'
                                }} />
                            </button>
                        </div>

                        {settings.notifications.enabled && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Notification Time</span>
                                    <input
                                        type="time"
                                        value={settings.notifications.time}
                                        onChange={(e) => handleNotificationTimeChange(e.target.value)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(30, 30, 46, 0.8)',
                                            color: '#ffffff',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Frequency</span>
                                    <select
                                        value={settings.notifications.frequency}
                                        onChange={(e) => handleNotificationFrequencyChange(e.target.value as 'daily' | 'weekly')}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(30, 30, 46, 0.8)',
                                            color: '#ffffff',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Appearance */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Appearance
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Theme</span>
                            <select
                                value={settings.theme}
                                onChange={(e) => handleThemeChange(e.target.value as 'dark' | 'light')}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    background: 'rgba(30, 30, 46, 0.8)',
                                    color: '#ffffff',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Auto-save</span>
                            <button
                                onClick={() => handleAutoSaveToggle(!settings.autoSave)}
                                style={{
                                    width: '3rem',
                                    height: '1.5rem',
                                    borderRadius: '1rem',
                                    background: settings.autoSave ? '#8b5cf6' : 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '1.25rem',
                                    height: '1.25rem',
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    position: 'absolute',
                                    top: '0.125rem',
                                    left: settings.autoSave ? '1.625rem' : '0.125rem',
                                    transition: 'left 0.3s ease'
                                }} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Data Management
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={exportData}
                            style={{ width: '100%', fontSize: '0.875rem' }}
                        >
                            Export Data
                        </button>

                        <label style={{ width: '100%' }}>
                            <input
                                type="file"
                                accept=".json"
                                onChange={importData}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="btn btn-outline"
                                style={{ width: '100%', fontSize: '0.875rem' }}
                                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                            >
                                Import Data
                            </button>
                        </label>

                        <button
                            className="btn btn-outline"
                            onClick={clearData}
                            style={{
                                width: '100%',
                                fontSize: '0.875rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                color: '#ef4444'
                            }}
                        >
                            Clear All Data
                        </button>
                    </div>
                </div>

                {/* PWA & Notifications Section */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        PWA & Notifications
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                                📱 Install App
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                                Install Progress Tracker on your home screen for a native app experience
                            </p>
                            <button
                                onClick={() => {
                                    if ('serviceWorker' in navigator) {
                                        navigator.serviceWorker.ready.then(registration => {
                                            registration.showNotification('Install Guide', {
                                                body: 'Check the floating controls at the bottom right for installation options!',
                                                icon: '/icon-192x192.png',
                                                requireInteraction: true
                                            })
                                        })
                                    }
                                }}
                                className="btn btn-primary"
                                style={{ fontSize: '0.875rem', width: '100%' }}
                            >
                                📋 Show Install Guide
                            </button>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '0.5rem' }}>
                                🔔 Test Notifications
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                                Test push notifications to ensure they work on your device
                            </p>
                            <button
                                onClick={async () => {
                                    if (!('Notification' in window)) {
                                        alert('This browser does not support notifications')
                                        return
                                    }

                                    if (Notification.permission !== 'granted') {
                                        const permission = await Notification.requestPermission()
                                        if (permission !== 'granted') {
                                            alert('Notification permission denied')
                                            return
                                        }
                                    }

                                    if ('serviceWorker' in navigator) {
                                        const registration = await navigator.serviceWorker.ready
                                        await registration.showNotification('Progress Tracker', {
                                            body: '🎉 Test notification working! Your notifications are set up correctly.',
                                            icon: '/icon-192x192.png',
                                            tag: 'test-notification',
                                            requireInteraction: true
                                        })
                                    } else {
                                        new Notification('Progress Tracker', {
                                            body: '🎉 Test notification working!',
                                            icon: '/icon-192x192.png'
                                        })
                                    }
                                }}
                                className="btn btn-primary"
                                style={{ fontSize: '0.875rem', width: '100%' }}
                            >
                                🧪 Send Test Notification
                            </button>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b', marginBottom: '0.5rem' }}>
                                📖 Installation Guide
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                                Learn how to install the app on your phone and set up notifications
                            </p>
                            <button
                                onClick={() => {
                                    window.open('/PWA_INSTALLATION.md', '_blank')
                                }}
                                className="btn btn-outline"
                                style={{ fontSize: '0.875rem', width: '100%' }}
                            >
                                📱 View Installation Guide
                            </button>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        About
                    </h3>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                            Progress Tracker v1.0.0
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            A personal productivity tracking app to help you build better habits and track your daily progress.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
} 