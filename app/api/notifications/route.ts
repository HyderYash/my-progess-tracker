import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { type, message } = await request.json()

        // For now, we'll just return success
        // In a real app, you'd send push notifications through a service like Firebase
        console.log('Notification request:', { type, message })

        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully'
        })
    } catch (error) {
        console.error('Error sending notification:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to send notification' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Notifications API is working',
        features: [
            'Test notifications',
            'Daily reminders',
            'Progress tracking alerts'
        ]
    })
} 