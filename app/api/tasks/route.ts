import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask } from '@/lib/db'

export async function GET() {
    try {
        const tasks = await getTasks()
        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { title } = await request.json()

        if (!title || typeof title !== 'string') {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const task = await createTask(title)
        return NextResponse.json(task)
    } catch (error) {
        console.error('Error creating task:', error)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
} 