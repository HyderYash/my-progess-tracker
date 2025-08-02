'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

interface ReportEntry {
    date: string
    entries: DailyEntry[]
    submitted: boolean
    updatedAt: string
}

interface ReportStats {
    totalDays: number
    averageRating: number
    mostConsistentTask: string
    mostSkippedTask: string
    bestPerformingTask: string
    worstPerformingTask: string
    weeklyTrend: { week: string; average: number }[]
    monthlyTrend: { month: string; average: number }[]
    taskPerformance: {
        taskId: string
        title: string
        averageRating: number
        consistency: number
        totalEntries: number
        improvement: number
    }[]
    dailyAverages: { date: string; average: number }[]
    streakInfo: {
        currentStreak: number
        longestStreak: number
        bestDay: string
        worstDay: string
    }
}

export default function Reports() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [entries, setEntries] = useState<ReportEntry[]>([])
    const [stats, setStats] = useState<ReportStats>({
        totalDays: 0,
        averageRating: 0,
        mostConsistentTask: '',
        mostSkippedTask: '',
        bestPerformingTask: '',
        worstPerformingTask: '',
        weeklyTrend: [],
        monthlyTrend: [],
        taskPerformance: [],
        dailyAverages: [],
        streakInfo: {
            currentStreak: 0,
            longestStreak: 0,
            bestDay: '',
            worstDay: ''
        }
    })

    // Loading states
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingTasks, setIsLoadingTasks] = useState(true)
    const [isLoadingEntries, setIsLoadingEntries] = useState(true)
    const [isLoadingStats, setIsLoadingStats] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadData = async () => {
        setIsLoading(true)
        setIsLoadingTasks(true)
        setIsLoadingEntries(true)
        setIsLoadingStats(true)

        try {
            // Load tasks
            const tasksResponse = await fetch('/api/tasks')
            if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json()
                setTasks(tasksData)
            }

            // Load all entries
            const entriesResponse = await fetch('/api/entries')
            if (entriesResponse.ok) {
                const entriesData = await entriesResponse.json()
                setEntries(entriesData)
            }
        } catch (error) {
            console.error('Error loading data:', error)
            setError('Failed to load data. Please try again.')
        } finally {
            setIsLoading(false)
            setIsLoadingTasks(false)
            setIsLoadingEntries(false)
            setIsLoadingStats(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Calculate stats when data changes
    useEffect(() => {
        if (tasks.length > 0 || entries.length > 0) {
            calculateStats()
        }
    }, [tasks, entries])

    const calculateStats = () => {
        if (tasks.length === 0 || entries.length === 0) {
            // Set default stats when no data is available
            setStats({
                totalDays: 0,
                averageRating: 0,
                mostConsistentTask: 'No data',
                mostSkippedTask: 'No data',
                bestPerformingTask: 'No data',
                worstPerformingTask: 'No data',
                weeklyTrend: [],
                monthlyTrend: [],
                taskPerformance: [],
                dailyAverages: [],
                streakInfo: {
                    currentStreak: 0,
                    longestStreak: 0,
                    bestDay: 'No data',
                    worstDay: 'No data'
                }
            })
            return
        }

        const submittedEntries = entries.filter(e => e.submitted)

        const totalDays = submittedEntries.length
        let totalRating = 0
        let totalRatings = 0

        // Calculate task performance
        const taskPerformance = tasks.map(task => {
            let totalTaskRating = 0
            let taskEntries = 0
            let skippedDays = 0

            submittedEntries.forEach(entry => {
                const taskEntry = entry.entries.find(e => e.taskId === task._id)
                if (taskEntry && taskEntry.rating > 0) {
                    totalTaskRating += taskEntry.rating
                    taskEntries++
                } else {
                    skippedDays++
                }
                totalRating += taskEntry?.rating || 0
                totalRatings += (taskEntry?.rating || 0) > 0 ? 1 : 0
            })

            const averageRating = taskEntries > 0 ? totalTaskRating / taskEntries : 0
            const consistency = totalDays > 0 ? (taskEntries / totalDays) * 100 : 0

            return {
                taskId: task._id,
                title: task.title,
                averageRating,
                consistency,
                totalEntries: taskEntries,
                improvement: 0 // Will calculate later
            }
        })

        // Calculate daily averages
        const dailyAverages = submittedEntries.map(entry => {
            const dailyRating = entry.entries.reduce((sum, e) => sum + e.rating, 0) / entry.entries.length
            return {
                date: entry.date,
                average: Math.round(dailyRating * 10) / 10
            }
        })

        // Find best/worst performing tasks
        const bestTask = taskPerformance.reduce((best, current) =>
            current.averageRating > best.averageRating ? current : best
        )
        const worstTask = taskPerformance.reduce((worst, current) =>
            current.averageRating < worst.averageRating && current.averageRating > 0 ? current : worst
        )
        const mostConsistent = taskPerformance.reduce((most, current) =>
            current.consistency > most.consistency ? current : most
        )
        const mostSkipped = taskPerformance.reduce((most, current) =>
            (totalDays - current.totalEntries) > (totalDays - most.totalEntries) ? current : most
        )

        // Calculate streaks
        const streakInfo = calculateStreaks(submittedEntries)

        // Calculate trends
        const weeklyTrend = calculateWeeklyTrend(submittedEntries)
        const monthlyTrend = calculateMonthlyTrend(submittedEntries)

        setStats({
            totalDays,
            averageRating: totalRatings > 0 ? Math.round((totalRating / totalRatings) * 10) / 10 : 0,
            mostConsistentTask: mostConsistent.title,
            mostSkippedTask: mostSkipped.title,
            bestPerformingTask: bestTask.title,
            worstPerformingTask: worstTask.title,
            weeklyTrend,
            monthlyTrend,
            taskPerformance,
            dailyAverages,
            streakInfo
        })
    }

    const calculateStreaks = (entries: ReportEntry[]) => {
        if (entries.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                bestDay: 'No data',
                worstDay: 'No data'
            }
        }

        const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0
        let bestDay = ''
        let worstDay = ''
        let bestRating = 0
        let worstRating = 5

        // Calculate streaks
        for (let i = 0; i < sortedEntries.length; i++) {
            if (i === 0 || isConsecutiveDay(sortedEntries[i - 1].date, sortedEntries[i].date)) {
                tempStreak++
            } else {
                tempStreak = 1
            }

            if (tempStreak > longestStreak) {
                longestStreak = tempStreak
            }
        }

        // Calculate current streak
        const today = new Date().toISOString().split('T')[0]
        const lastEntry = sortedEntries[sortedEntries.length - 1]
        if (lastEntry && isConsecutiveDay(lastEntry.date, today)) {
            currentStreak = tempStreak
        }

        // Find best and worst days
        entries.forEach(entry => {
            const dailyRating = entry.entries.reduce((sum, e) => sum + e.rating, 0) / entry.entries.length
            if (dailyRating > bestRating) {
                bestRating = dailyRating
                bestDay = entry.date
            }
            if (dailyRating < worstRating) {
                worstRating = dailyRating
                worstDay = entry.date
            }
        })

        return {
            currentStreak,
            longestStreak,
            bestDay,
            worstDay
        }
    }

    const isConsecutiveDay = (date1: string, date2: string) => {
        const d1 = new Date(date1)
        const d2 = new Date(date2)
        const diffTime = Math.abs(d2.getTime() - d1.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays === 1
    }

    const calculateWeeklyTrend = (entries: ReportEntry[]) => {
        const weeklyData: { [key: string]: number[] } = {}

        entries.forEach(entry => {
            const date = new Date(entry.date)
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            const weekKey = weekStart.toISOString().split('T')[0]

            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = []
            }

            const dailyAverage = entry.entries.reduce((sum, e) => sum + e.rating, 0) / entry.entries.length
            weeklyData[weekKey].push(dailyAverage)
        })

        return Object.entries(weeklyData).map(([week, ratings]) => ({
            week: new Date(week + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            average: Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
        })).slice(-8) // Last 8 weeks
    }

    const calculateMonthlyTrend = (entries: ReportEntry[]) => {
        const monthlyData: { [key: string]: number[] } = {}

        entries.forEach(entry => {
            const date = new Date(entry.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = []
            }

            const dailyAverage = entry.entries.reduce((sum, e) => sum + e.rating, 0) / entry.entries.length
            monthlyData[monthKey].push(dailyAverage)
        })

        return Object.entries(monthlyData).map(([month, ratings]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            average: Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
        })).slice(-6) // Last 6 months
    }

    const exportToCSV = () => {
        if (entries.length === 0) return

        const csvData = entries.map(entry => {
            const row = [entry.date]
            tasks.forEach(task => {
                const taskEntry = entry.entries.find(e => e.taskId === task._id)
                row.push(taskEntry?.rating?.toString() || '')
                row.push(taskEntry?.note || '')
            })
            return row.join(',')
        })

        const headers = ['Date', ...tasks.flatMap(task => [task.title + ' Rating', task.title + ' Notes'])]
        const csv = [headers.join(','), ...csvData].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `progress-tracker-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const renderBarChart = (data: { week?: string; month?: string; average: number }[], title: string, color: string) => {
        const maxValue = Math.max(...data.map(d => d.average), 5)

        return (
            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.75rem', textAlign: 'center' }}>
                    {title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', minWidth: '3rem' }}>
                                {item.week || item.month}
                            </span>
                            <div style={{
                                flex: 1,
                                height: '1.5rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.25rem',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: `${(item.average / maxValue) * 100}%`,
                                    height: '100%',
                                    background: color,
                                    borderRadius: '0.25rem',
                                    transition: 'width 0.3s ease'
                                }} />
                                <span style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '0.625rem',
                                    color: '#ffffff',
                                    fontWeight: '600'
                                }}>
                                    {item.average}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderProgressRing = (percentage: number, label: string, color: string) => {
        const radius = 30
        const circumference = 2 * Math.PI * radius
        const strokeDasharray = circumference
        const strokeDashoffset = circumference - (percentage / 100) * circumference

        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="4"
                            fill="none"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke={color}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#ffffff'
                    }}>
                        {Math.round(percentage)}%
                    </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.5rem' }}>
                    {label}
                </p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="loading">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading reports...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="error">
                    <div className="error-icon">⚠️</div>
                    <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>{error}</p>
                    <button
                        className="btn btn-outline"
                        onClick={loadData}
                        style={{ fontSize: '0.875rem' }}
                    >
                        Retry
                    </button>
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
                        <h1 className="gradient-text">Reports & Analytics</h1>
                        <p>Track your progress and identify patterns</p>
                        <nav>
                            <Link href="/" className="nav-link">Dashboard</Link>
                            <Link href="/calendar" className="nav-link">Calendar</Link>
                            <Link href="/reports" className="nav-link active">Reports</Link>
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
                {/* Overview Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>{isLoadingStats ? '...' : (stats.totalDays || 0)}</h3>
                            <p>Days Tracked</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <h3>{isLoadingStats ? '...' : (stats.averageRating || 0)}</h3>
                            <p>Avg Rating</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-content">
                            <h3>{isLoadingStats || !stats.streakInfo ? '...' : stats.streakInfo.currentStreak}</h3>
                            <p>Current Streak</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                            <h3>{isLoadingStats || !stats.streakInfo ? '...' : stats.streakInfo.longestStreak}</h3>
                            <p>Longest Streak</p>
                        </div>
                    </div>
                </div>

                {/* No Data Message */}
                {!isLoading && tasks.length === 0 && (
                    <div className="dashboard-card" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(13, 148, 136, 0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '2rem'
                        }}>
                            📊
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem' }}>
                            No Data Available
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            Start tracking your daily progress to see beautiful analytics and insights!
                        </p>
                        <Link href="/">
                            <button className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                                Go to Dashboard
                            </button>
                        </Link>
                    </div>
                )}

                {/* Insights Section */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Key Insights
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '0.5rem' }}>
                                Best Performing Task
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {isLoadingStats ? '...' : (stats.bestPerformingTask || 'No data')}
                            </p>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                                Most Consistent
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {isLoadingStats ? '...' : (stats.mostConsistentTask || 'No data')}
                            </p>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444', marginBottom: '0.5rem' }}>
                                Needs Attention
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {isLoadingStats ? '...' : (stats.mostSkippedTask || 'No data')}
                            </p>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b', marginBottom: '0.5rem' }}>
                                Best Day
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {isLoadingStats || !stats.streakInfo ? '...' : (stats.streakInfo.bestDay || 'No data')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Performance Trends
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {isLoadingStats ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="spinner"></div>
                                <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading trends...</p>
                            </div>
                        ) : (
                            <>
                                {renderBarChart(stats.weeklyTrend || [], 'Weekly Performance Trend', 'linear-gradient(135deg, #8b5cf6, #0d9488)')}
                                {renderBarChart(stats.monthlyTrend || [], 'Monthly Performance Trend', 'linear-gradient(135deg, #10b981, #059669)')}
                            </>
                        )}
                    </div>
                </div>

                {/* Task Performance Analysis */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Task Performance Analysis
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {isLoadingStats ? (
                            <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
                                <div className="spinner"></div>
                                <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading task analysis...</p>
                            </div>
                        ) : (
                            (stats.taskPerformance || []).map(task => (
                                <div key={task.taskId} style={{
                                    padding: '1rem',
                                    background: 'rgba(30, 30, 46, 0.5)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <h4 style={{ fontWeight: '500', color: '#ffffff', fontSize: '0.875rem' }}>{task.title}</h4>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: task.averageRating >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)'
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Avg: {task.averageRating.toFixed(1)}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Entries: {task.totalEntries}
                                        </span>
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: '0.5rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.25rem',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${task.consistency}%`,
                                            height: '100%',
                                            background: 'linear-gradient(135deg, #8b5cf6, #0d9488)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            Consistency
                                        </span>
                                        <span style={{ fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {task.consistency.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Progress Overview Rings */}
                <div className="dashboard-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
                        Progress Overview
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                        {isLoadingStats ? (
                            <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
                                <div className="spinner"></div>
                                <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading progress...</p>
                            </div>
                        ) : (
                            <>
                                {renderProgressRing(
                                    stats.totalDays > 0 ? (stats.totalDays / 30) * 100 : 0,
                                    'Monthly Goal',
                                    'linear-gradient(135deg, #8b5cf6, #0d9488)'
                                )}
                                {renderProgressRing(
                                    stats.averageRating > 0 ? (stats.averageRating / 5) * 100 : 0,
                                    'Rating Goal',
                                    'linear-gradient(135deg, #10b981, #059669)'
                                )}
                                {renderProgressRing(
                                    stats.streakInfo && stats.streakInfo.currentStreak > 0 ? (stats.streakInfo.currentStreak / 7) * 100 : 0,
                                    'Weekly Goal',
                                    'linear-gradient(135deg, #f59e0b, #d97706)'
                                )}
                                {renderProgressRing(
                                    stats.taskPerformance && stats.taskPerformance.length > 0 ?
                                        (stats.taskPerformance.filter(t => t.consistency > 80).length / stats.taskPerformance.length) * 100 : 0,
                                    'Consistency',
                                    'linear-gradient(135deg, #ef4444, #dc2626)'
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Export Button */}
                <div className="dashboard-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={exportToCSV}
                            disabled={entries.length === 0}
                            style={{ fontSize: '0.875rem' }}
                        >
                            Export to CSV
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
} 