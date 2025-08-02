'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DailyItem } from '@/components/DailyItem'
import { cn } from '@/lib/utils'
import { getTodayString } from '@/lib/utils'

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

export default function DailyEntryPage() {
    const [today] = useState(getTodayString())
    const [tasks, setTasks] = useState<Task[]>([])
    const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [isAddingTask, setIsAddingTask] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Load tasks and today's entry on component mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Load tasks from localStorage (simulating database)
            const savedTasks = localStorage.getItem('tasks')
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks))
            } else {
                // Default tasks
                const defaultTasks: Task[] = [
                    { _id: '1', title: 'Workout', createdAt: new Date().toISOString() },
                    { _id: '2', title: 'Interview Prep', createdAt: new Date().toISOString() },
                    { _id: '3', title: 'Reading', createdAt: new Date().toISOString() },
                    { _id: '4', title: 'Meditation', createdAt: new Date().toISOString() }
                ]
                setTasks(defaultTasks)
                localStorage.setItem('tasks', JSON.stringify(defaultTasks))
            }

            // Load today's entry
            const savedEntry = localStorage.getItem(`daily-entry-${today}`)
            if (savedEntry) {
                const entry = JSON.parse(savedEntry)
                setDailyEntries(entry.entries || [])
                setIsSubmitted(entry.submitted || false)
            } else {
                // Initialize empty entries for all tasks
                const savedTasks = localStorage.getItem('tasks')
                const currentTasks = savedTasks ? JSON.parse(savedTasks) : []
                const initialEntries: DailyEntry[] = currentTasks.map((task: Task) => ({
                    taskId: task._id,
                    rating: 0,
                    note: ''
                }))
                setDailyEntries(initialEntries)
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRatingChange = (taskId: string, rating: number) => {
        setDailyEntries(prev =>
            prev.map(entry =>
                entry.taskId === taskId
                    ? { ...entry, rating }
                    : entry
            )
        )
        saveEntry()
    }

    const handleNoteChange = (taskId: string, note: string) => {
        setDailyEntries(prev =>
            prev.map(entry =>
                entry.taskId === taskId
                    ? { ...entry, note }
                    : entry
            )
        )
        // Note changes are auto-saved via debounce in DailyItem component
    }

    const saveEntry = () => {
        const entry = {
            date: today,
            entries: dailyEntries,
            submitted: isSubmitted,
            updatedAt: new Date().toISOString()
        }
        localStorage.setItem(`daily-entry-${today}`, JSON.stringify(entry))
    }

    const handleSubmit = () => {
        setIsSubmitted(true)
        saveEntry()

        // Update stats
        const completedTasks = dailyEntries.filter(entry => entry.rating > 0).length
        const averageRating = dailyEntries.length > 0
            ? dailyEntries.reduce((sum, entry) => sum + entry.rating, 0) / dailyEntries.length
            : 0

        const stats = {
            totalTasks: tasks.length,
            completedToday: completedTasks,
            averageRating: Math.round(averageRating * 10) / 10,
            streak: 1 // This would be calculated from historical data
        }
        localStorage.setItem('progress-stats', JSON.stringify(stats))
    }

    const addNewTask = () => {
        if (newTaskTitle.trim()) {
            const newTask: Task = {
                _id: Date.now().toString(),
                title: newTaskTitle.trim(),
                createdAt: new Date().toISOString()
            }

            const updatedTasks = [...tasks, newTask]
            setTasks(updatedTasks)
            localStorage.setItem('tasks', JSON.stringify(updatedTasks))

            // Add entry for new task
            const newEntry: DailyEntry = {
                taskId: newTask._id,
                rating: 0,
                note: ''
            }
            setDailyEntries(prev => [...prev, newEntry])

            setNewTaskTitle('')
            setIsAddingTask(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    ← Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Daily Entry</h1>
                                <p className="text-muted-foreground">{today}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSubmitted && (
                                <span className="text-sm text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">
                                    ✓ Submitted
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Add New Task */}
                <div className="mb-8">
                    {!isAddingTask ? (
                        <Button
                            onClick={() => setIsAddingTask(true)}
                            variant="outline"
                            className="dashboard-card"
                        >
                            + Add New Task
                        </Button>
                    ) : (
                        <div className="dashboard-card bg-card border border-border rounded-lg p-4">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Enter task name..."
                                    className="flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                                />
                                <Button onClick={addNewTask} size="sm">
                                    Add
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsAddingTask(false)
                                        setNewTaskTitle('')
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Daily Tasks */}
                <div className="space-y-4">
                    {tasks.map((task) => {
                        const entry = dailyEntries.find(e => e.taskId === task._id) || {
                            taskId: task._id,
                            rating: 0,
                            note: ''
                        }

                        return (
                            <DailyItem
                                key={task._id}
                                taskId={task._id}
                                taskTitle={task.title}
                                rating={entry.rating}
                                note={entry.note}
                                onRatingChange={handleRatingChange}
                                onNoteChange={handleNoteChange}
                            />
                        )
                    })}
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {isSubmitted
                                ? "Today's entry has been submitted. You can still make changes."
                                : "Rate your tasks and add notes. Changes are auto-saved."
                            }
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className="dashboard-card"
                        >
                            {isSubmitted ? 'Already Submitted' : 'Submit Daily Entry'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
} 