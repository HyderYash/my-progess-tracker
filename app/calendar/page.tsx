'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Task {
    _id: string
    title: string
    createdAt: string
}

interface DailyEntry {
    taskId: string
    rating: number
    note: string
}

interface CalendarEntry {
    date: string
    entries: DailyEntry[]
    submitted: boolean
    updatedAt: string
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [calendarData, setCalendarData] = useState<CalendarEntry[]>([])

    // Loading states
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingTasks, setIsLoadingTasks] = useState(true)
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(true)

    const loadData = async () => {
        setIsLoading(true)
        setIsLoadingTasks(true)
        setIsLoadingCalendar(true)

        try {
            // Load tasks
            const tasksResponse = await fetch('/api/tasks')
            if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json()
                setTasks(tasksData)
            }

            // Load calendar data for the current month
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]

            const calendarResponse = await fetch(`/api/entries?startDate=${startDate}&endDate=${endDate}`)
            if (calendarResponse.ok) {
                const calendarData = await calendarResponse.json()
                setCalendarData(calendarData)
            }
        } catch (error) {
            console.error('Error loading calendar data:', error)
        } finally {
            setIsLoading(false)
            setIsLoadingTasks(false)
            setIsLoadingCalendar(false)
        }
    }

    // Reload data when currentDate changes
    useEffect(() => {
        loadData()
    }, [currentDate])

    // Load data on mount
    useEffect(() => {
        loadData()
    }, [])

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const getCalendarDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const days: (string | null)[] = []
        const currentDay = new Date(startDate)

        while (currentDay <= lastDay || currentDay.getDay() !== 0) {
            if (currentDay.getMonth() === month) {
                days.push(currentDay.toISOString().split('T')[0])
            } else {
                days.push(null)
            }
            currentDay.setDate(currentDay.getDate() + 1)
        }

        return days
    }

    const getAverageRatingForDate = (dateStr: string) => {
        const entry = calendarData.find(e => e.date === dateStr)
        if (!entry || !entry.entries || entry.entries.length === 0) return 0

        const totalRating = entry.entries.reduce((sum, e) => sum + e.rating, 0)
        return Math.round((totalRating / entry.entries.length) * 10) / 10
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return '#10b981' // Green
        if (rating >= 3) return '#f59e0b' // Yellow
        if (rating >= 2) return '#f97316' // Orange
        return '#ef4444' // Red
    }

    const getSelectedDateEntry = () => {
        if (!selectedDate) return null
        return calendarData.find(e => e.date === selectedDate)
    }

    if (isLoading) {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="loading">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading calendar...</p>
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
                        <h1 className="gradient-text">Calendar View</h1>
                        <p>Track your progress over time</p>
                        <nav>
                            <Link href="/" className="nav-link">Dashboard</Link>
                            <Link href="/calendar" className="nav-link active">Calendar</Link>
                            <Link href="/reports" className="nav-link">Reports</Link>
                            <Link href="/settings" className="nav-link">Settings</Link>
                            <button
                                onClick={loadData}
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
                <div className="calendar-container">
                    {/* Calendar */}
                    <div>
                        <div className="dashboard-card">
                            {/* Calendar Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <button className="btn btn-outline" onClick={previousMonth} style={{ padding: '0.5rem', minWidth: '2.5rem' }}>
                                    ←
                                </button>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', textAlign: 'center' }}>
                                    {currentDate.toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </h2>
                                <button className="btn btn-outline" onClick={nextMonth} style={{ padding: '0.5rem', minWidth: '2.5rem' }}>
                                    →
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            {isLoadingCalendar ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <div className="calendar-grid">
                                    {/* Day headers */}
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="calendar-day-header">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Calendar days */}
                                    {getCalendarDays().map((dateStr, index) => {
                                        if (!dateStr) {
                                            return <div key={index} className="calendar-day empty" />
                                        }

                                        const averageRating = getAverageRatingForDate(dateStr)
                                        const entry = calendarData.find(e => e.date === dateStr)
                                        const isToday = dateStr === new Date().toISOString().split('T')[0]
                                        const isSelected = selectedDate === dateStr
                                        const isCompleted = entry?.submitted

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                                            >
                                                <div className="calendar-day-number">
                                                    {new Date(dateStr).getDate()}
                                                </div>
                                                {averageRating > 0 && (
                                                    <div
                                                        className="calendar-day-rating"
                                                        style={{
                                                            background: getRatingColor(averageRating)
                                                        }}
                                                    />
                                                )}
                                                {isCompleted && (
                                                    <div className="calendar-day-submitted">✓</div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Legend */}
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(30, 30, 46, 0.5)', borderRadius: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.75rem', textAlign: 'center' }}>Legend:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#10b981' }}></div>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Excellent (4-5)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#f59e0b' }}></div>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Good (3)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#f97316' }}></div>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Fair (2)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#ef4444' }}></div>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Poor (1)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <div style={{ color: '#10b981', fontSize: '0.875rem' }}>✓</div>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Completed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Date Details */}
                    <div>
                        <div className="dashboard-card">
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                                {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                            </h3>

                            {selectedDate && getSelectedDateEntry() ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {getSelectedDateEntry()?.submitted && (
                                        <div style={{
                                            padding: '0.75rem',
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            justifyContent: 'center'
                                        }}>
                                            <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>Entry Completed</span>
                                        </div>
                                    )}

                                    {getSelectedDateEntry()?.entries.map((entry) => {
                                        const task = tasks.find(t => t._id === entry.taskId)
                                        if (!task) return null

                                        return (
                                            <div key={entry.taskId} style={{
                                                borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
                                                paddingBottom: '0.75rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <h4 style={{ fontWeight: '500', color: '#ffffff', fontSize: '0.875rem' }}>{task.title}</h4>
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span
                                                                key={star}
                                                                style={{
                                                                    fontSize: '0.875rem',
                                                                    color: entry.rating >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)'
                                                                }}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {entry.note && (
                                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>{entry.note}</p>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {getSelectedDateEntry()?.entries.length === 0 && (
                                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textAlign: 'center' }}>
                                            No entries for this date
                                        </p>
                                    )}

                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                        <Link href="/">
                                            <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem' }}>
                                                Go to Daily Entry
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', textAlign: 'center' }}>
                                    Click on a date to view details
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 