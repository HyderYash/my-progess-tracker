'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DailyItem } from '@/components/DailyItem'
import { debounce } from '@/lib/utils'

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

interface DailyEntryData {
  date: string
  entries: DailyEntry[]
  submitted: boolean
  updatedAt: string
}

interface Stats {
  totalTasks: number
  totalEntries: number
  averageRating: number
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, totalEntries: 0, averageRating: 0 })

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isLoadingEntries, setIsLoadingEntries] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const router = useRouter()

  // Load data from database
  const loadData = async () => {
    setIsLoading(true)
    setIsLoadingStats(true)
    setIsLoadingTasks(true)
    setIsLoadingEntries(true)

    try {
      // Load tasks
      const tasksResponse = await fetch('/api/tasks')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }

      // Load today's entry
      const entryResponse = await fetch(`/api/entries?date=${today}`)
      if (entryResponse.ok) {
        const entryData = await entryResponse.json()
        if (entryData) {
          setIsSubmitted(entryData.submitted)
          setDailyEntries(entryData.entries || [])
        } else {
          setIsSubmitted(false)
          setDailyEntries([])
        }
      }

      // Load stats
      const statsResponse = await fetch('/api/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingStats(false)
      setIsLoadingTasks(false)
      setIsLoadingEntries(false)
    }
  }

  // Use custom hook for reliable data loading
  useEffect(() => {
    loadData()
  }, [])

  // Initialize daily entries when tasks load
  useEffect(() => {
    if (tasks.length > 0 && dailyEntries.length === 0) {
      const initialEntries = tasks.map(task => ({
        taskId: task._id,
        rating: 0,
        note: ''
      }))
      setDailyEntries(initialEntries)
    }
  }, [tasks, dailyEntries.length])

  const handleRatingChange = (taskIndex: number, rating: number) => {
    console.log('Main page rating change called:', taskIndex, rating)
    console.log('Current dailyEntries before:', dailyEntries)

    const updatedEntries = [...dailyEntries]
    updatedEntries[taskIndex] = { ...updatedEntries[taskIndex], rating }
    setDailyEntries(updatedEntries)

    console.log('Updated entries:', updatedEntries)

    // Auto-save after rating change
    saveEntry(updatedEntries)
  }

  const handleNoteChange = (taskIndex: number, note: string) => {
    const updatedEntries = [...dailyEntries]
    updatedEntries[taskIndex] = { ...updatedEntries[taskIndex], note }
    setDailyEntries(updatedEntries)

    // Auto-save after note change
    saveEntry(updatedEntries)
  }

  const saveEntry = async (entries: DailyEntry[]) => {
    console.log('Saving entry...')
    console.log('saveEntry called with dailyEntries:', entries)

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          entries: entries,
          submitted: false
        }),
      })

      if (response.ok) {
        console.log('Entry saved successfully')
      } else {
        console.error('Failed to save entry')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          entries: dailyEntries,
          submitted: true
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setIsEditing(false)
        // Reload data to get updated stats
        await loadData()
      }
    } catch (error) {
      console.error('Error submitting entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsSubmitted(false)
  }

  const handleSaveEdit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          entries: dailyEntries,
          submitted: true
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setIsEditing(false)
        // Reload data to get updated stats
        await loadData()
      }
    } catch (error) {
      console.error('Error saving edit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsSubmitted(true)
    // Reload original data
    loadData()
  }

  const addNewTask = async () => {
    const taskName = prompt('Enter task name:')
    if (!taskName?.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: taskName.trim() }),
      })

      if (response.ok) {
        // Reload all data to get updated tasks and stats
        await loadData()
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const nextStep = () => {
    if (isEditing) {
      // In edit mode, allow circular navigation
      setCurrentStep((currentStep + 1) % tasks.length)
    } else {
      // In normal mode, only go forward if not at the end
      if (currentStep < tasks.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (isEditing) {
      // In edit mode, allow circular navigation
      setCurrentStep(currentStep === 0 ? tasks.length - 1 : currentStep - 1)
    } else {
      // In normal mode, only go backward if not at the beginning
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const canProceed = () => {
    return dailyEntries[currentStep]?.rating > 0
  }

  const canSubmit = () => {
    return dailyEntries.every(entry => entry.rating > 0)
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>Loading your dashboard...</p>
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
            <h1 className="gradient-text">Progress Tracker</h1>
            <p>Track your daily progress and build better habits</p>
            <nav>
              <Link href="/" className="nav-link active">Dashboard</Link>
              <Link href="/calendar" className="nav-link">Calendar</Link>
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
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{isLoadingStats ? '...' : stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{isLoadingStats ? '...' : stats.totalEntries}</h3>
              <p>Days Tracked</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{isLoadingStats ? '...' : stats.averageRating}</h3>
              <p>Avg Rating</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{isLoadingEntries ? '...' : `${dailyEntries.filter(e => e.rating > 0).length}/${tasks.length}`}</h3>
              <p>Today's Progress</p>
            </div>
          </div>
        </div>

        {/* Daily Entry Status */}
        {isSubmitted && !isEditing && (
          <div className="dashboard-card" style={{ textAlign: 'center' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              ✅
            </div>
            <h2 className="gradient-text" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Daily Entry Completed!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Great job completing today's check-in. Keep up the momentum!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={handleEdit} className="btn btn-outline" style={{ width: '100%', maxWidth: '200px' }}>
                Edit Entry
              </button>
              <Link href="/calendar" style={{ width: '100%', maxWidth: '200px' }}>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  View Calendar
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Daily Entry Form */}
        {(!isSubmitted || isEditing) && (
          <div className="dashboard-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', textAlign: 'center' }}>
                {isEditing ? 'Edit Daily Entry' : `Daily Entry - Step ${currentStep + 1} of ${tasks.length}`}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={addNewTask} style={{ fontSize: '0.875rem' }}>
                  + Add Task
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="progress-indicator">
              {tasks.map((_, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className={`progress-step ${index <= currentStep ? 'active' : ''} ${dailyEntries[index]?.rating > 0 ? 'completed' : ''}`}
                    style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (isEditing) {
                        setCurrentStep(index)
                      }
                    }}
                  >
                    {dailyEntries[index]?.rating > 0 ? '✓' : index + 1}
                  </div>
                  {index < tasks.length - 1 && (
                    <div className={`progress-connector ${index < currentStep ? 'active' : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current Task */}
            {tasks[currentStep] && (
              <div style={{ marginTop: '1.5rem' }}>
                <DailyItem
                  taskId={tasks[currentStep]._id}
                  taskTitle={tasks[currentStep].title}
                  rating={dailyEntries[currentStep]?.rating || 0}
                  note={dailyEntries[currentStep]?.note || ''}
                  onRatingChange={(taskId, rating) => {
                    const taskIndex = tasks.findIndex(t => t._id === taskId)
                    if (taskIndex !== -1) {
                      handleRatingChange(taskIndex, rating)
                    }
                  }}
                  onNoteChange={(taskId, note) => {
                    const taskIndex = tasks.findIndex(t => t._id === taskId)
                    if (taskIndex !== -1) {
                      handleNoteChange(taskIndex, note)
                    }
                  }}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={prevStep}
                  disabled={!isEditing && currentStep === 0}
                  style={{ flex: 1 }}
                >
                  Previous
                </button>

                {currentStep < tasks.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={!isEditing && !canProceed()}
                    style={{ flex: 1 }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={isEditing ? handleSaveEdit : handleSubmit}
                    disabled={!canSubmit() || isSubmitting}
                    style={{ flex: 1 }}
                  >
                    {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Submit Daily Entry')}
                  </button>
                )}
              </div>

              {isEditing && (
                <button
                  className="btn btn-outline"
                  onClick={handleCancelEdit}
                  style={{ width: '100%' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/calendar">
              <button className="btn btn-outline" style={{ width: '100%' }}>View Calendar</button>
            </Link>
            <Link href="/reports">
              <button className="btn btn-outline" style={{ width: '100%' }}>View Reports</button>
            </Link>
            <button className="btn btn-outline" onClick={addNewTask} style={{ width: '100%' }}>
              Add New Task
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
