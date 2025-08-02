import * as React from "react"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        const textareaStyles: React.CSSProperties = {
            display: 'flex',
            minHeight: '5rem',
            width: '100%',
            borderRadius: '0.375rem',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'rgba(30, 30, 46, 0.8)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            color: '#ffffff',
            outline: 'none',
            transition: 'all 0.2s ease',
            resize: 'vertical'
        }

        return (
            <textarea
                style={textareaStyles}
                className={className}
                ref={ref}
                onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'
                    e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.2)'
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                    e.target.style.boxShadow = 'none'
                }}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea } 