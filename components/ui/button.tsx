import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'success' | 'warning'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const getVariantStyles = (): React.CSSProperties => {
            switch (variant) {
                case 'default':
                    return {
                        background: 'linear-gradient(135deg, #8b5cf6, #0d9488)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
                    }
                case 'destructive':
                    return {
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
                    }
                case 'outline':
                    return {
                        background: 'rgba(30, 30, 46, 0.8)',
                        color: '#ffffff',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }
                case 'secondary':
                    return {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                        color: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }
                case 'ghost':
                    return {
                        background: 'transparent',
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                case 'link':
                    return {
                        background: 'transparent',
                        color: '#8b5cf6',
                        textDecoration: 'underline'
                    }
                case 'gradient':
                    return {
                        background: 'linear-gradient(135deg, #8b5cf6, #0d9488, #3b82f6)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)'
                    }
                case 'success':
                    return {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                    }
                case 'warning':
                    return {
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
                    }
                default:
                    return {
                        background: 'linear-gradient(135deg, #8b5cf6, #0d9488)',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
                    }
            }
        }

        const getSizeStyles = (): React.CSSProperties => {
            switch (size) {
                case 'sm':
                    return {
                        height: '2.25rem',
                        padding: '0.25rem 1rem',
                        fontSize: '0.75rem'
                    }
                case 'lg':
                    return {
                        height: '3rem',
                        padding: '0.75rem 2rem',
                        fontSize: '1rem'
                    }
                case 'icon':
                    return {
                        height: '2.5rem',
                        width: '2.5rem',
                        padding: '0'
                    }
                default:
                    return {
                        height: '2.75rem',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.875rem'
                    }
            }
        }

        const baseStyles: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            borderRadius: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            border: 'none',
            outline: 'none',
            ...getVariantStyles(),
            ...getSizeStyles()
        }

        return (
            <button
                style={baseStyles}
                className={className}
                ref={ref}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    const variantStyles = getVariantStyles()
                    e.currentTarget.style.boxShadow = variantStyles.boxShadow || 'none'
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                }}
                {...props}
            >
                <span style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {props.children}
                </span>
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button } 