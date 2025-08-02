'use client'

import { useState } from 'react'

interface RatingStarsProps {
    rating: number
    onRatingChange: (rating: number) => void
    readonly?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function RatingStars({ rating, onRatingChange, readonly = false, size = 'md' }: RatingStarsProps) {
    const [hoverRating, setHoverRating] = useState(0)

    const sizeStyles = {
        sm: { width: '1rem', height: '1rem' },
        md: { width: '1.25rem', height: '1.25rem' },
        lg: { width: '1.5rem', height: '1.5rem' },
        xl: { width: '2rem', height: '2rem' }
    }

    const handleStarClick = (starRating: number) => {
        console.log('Star clicked:', starRating, 'readonly:', readonly)
        if (!readonly) {
            console.log('Calling onRatingChange with:', starRating)
            onRatingChange(starRating)
        }
    }

    const handleStarHover = (starRating: number) => {
        if (!readonly) {
            setHoverRating(starRating)
        }
    }

    const handleStarLeave = () => {
        if (!readonly) {
            setHoverRating(0)
        }
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            pointerEvents: readonly ? 'none' : 'auto'
        }}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = readonly ? rating >= star : (hoverRating >= star || rating >= star)

                return (
                    <div
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                        style={{
                            ...sizeStyles[size],
                            cursor: readonly ? 'default' : 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.2s ease-in-out',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)',
                            transform: readonly ? 'none' : 'scale(1)',
                            minWidth: sizeStyles[size].width,
                            minHeight: sizeStyles[size].height
                        }}
                        onMouseOver={(e) => {
                            if (!readonly) {
                                e.currentTarget.style.transform = 'scale(1.1)'
                                e.currentTarget.style.color = isFilled ? '#fbbf24' : '#fde047'
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!readonly) {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.color = isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                        onMouseDown={(e) => {
                            if (!readonly) {
                                e.currentTarget.style.transform = 'scale(0.95)'
                            }
                        }}
                        onMouseUp={(e) => {
                            if (!readonly) {
                                e.currentTarget.style.transform = 'scale(1.1)'
                            }
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            style={{ width: '100%', height: '100%' }}
                            fill={isFilled ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                    </div>
                )
            })}
        </div>
    )
} 