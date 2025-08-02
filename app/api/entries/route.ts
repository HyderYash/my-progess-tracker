import { NextRequest, NextResponse } from 'next/server'
import { getDailyEntry, saveDailyEntry, getAllEntries, getEntriesForDateRange } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        if (date) {
            const entry = await getDailyEntry(date)
            return NextResponse.json(entry)
        } else if (startDate && endDate) {
            const entries = await getEntriesForDateRange(startDate, endDate)
            return NextResponse.json(entries)
        } else {
            const entries = await getAllEntries()
            return NextResponse.json(entries)
        }
    } catch (error) {
        console.error('Error fetching entries:', error)
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { date, entries, submitted } = await request.json()

        if (!date || !Array.isArray(entries)) {
            return NextResponse.json({ error: 'Date and entries are required' }, { status: 400 })
        }

        const entry = await saveDailyEntry(date, entries, submitted || false)
        return NextResponse.json(entry)
    } catch (error) {
        console.error('Error saving entry:', error)
        return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
    }
} 