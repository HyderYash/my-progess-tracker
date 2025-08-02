'use client'

import { useState, useEffect } from 'react'
import { RatingStars } from './RatingStars'
import { debounce } from '@/lib/utils'

interface DailyItemProps {
    taskId: string
    taskTitle: string
    rating: number
    note: string
    onRatingChange: (taskId: string, rating: number) => void
    onNoteChange: (taskId: string, note: string) => void
}

export function DailyItem({ taskId, taskTitle, rating, note, onRatingChange, onNoteChange }: DailyItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [localNote, setLocalNote] = useState(note)

    useEffect(() => {
        setLocalNote(note)
    }, [note])

    const debouncedNoteChange = debounce((value: string) => {
        onNoteChange(taskId, value)
    }, 500)

    const handleNoteChange = (value: string) => {
        setLocalNote(value)
        debouncedNoteChange(value)
    }

    const handleRatingChange = (newRating: number) => {
        console.log('Rating changed:', newRating)
        onRatingChange(taskId, newRating)
    }

    return (
        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
            {/* Task Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(13, 148, 136, 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg style={{ width: '1.25rem', height: '1.25rem', color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{taskTitle}</h3>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>How did you perform on this task today?</p>
            </div>

            {/* Rating Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#ffffff' }}>Rate this task:</span>
                        <RatingStars
                            rating={rating}
                            onRatingChange={handleRatingChange}
                            size="xl"
                        />
                    </div>

                    {rating > 0 && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(13, 148, 136, 0.1))',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>Your rating:</span>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff' }}>
                                {rating} out of 5 stars
                            </span>
                            <div style={{ display: 'flex', gap: '0.125rem' }}>
                                {[...Array(rating)].map((_, i) => (
                                    <svg key={i} style={{ width: '0.875rem', height: '0.875rem', color: '#fbbf24' }} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn btn-outline"
                        style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            color: '#8b5cf6',
                            fontSize: '0.875rem',
                            padding: '0.75rem 1.25rem',
                            minHeight: '2.75rem'
                        }}
                    >
                        <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {isExpanded ? 'Hide Notes' : 'Add Notes'}
                    </button>
                </div>

                {isExpanded && (
                    <div style={{ marginTop: '1rem' }}>
                        <textarea
                            value={localNote}
                            onChange={(e) => handleNoteChange(e.target.value)}
                            placeholder="Add your notes about this task..."
                            style={{
                                width: '100%',
                                minHeight: '5rem',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                background: 'rgba(30, 30, 46, 0.8)',
                                color: '#ffffff',
                                fontSize: '0.875rem',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
} 