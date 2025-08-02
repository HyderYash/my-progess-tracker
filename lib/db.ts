import { MongoClient, ObjectId } from 'mongodb'

// Global client instance to reuse connections
let client: MongoClient | null = null

async function getClient(): Promise<MongoClient> {
    if (!client) {
        const uri = process.env.MONGODB_URI
        if (!uri) {
            throw new Error('MONGODB_URI is not defined')
        }
        client = new MongoClient(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        await client.connect()
    }
    return client
}

export interface Task {
    _id: string
    title: string
    createdAt: string
}

export interface DailyEntry {
    taskId: string
    rating: number
    note: string
}

export interface DailyEntryData {
    date: string
    entries: DailyEntry[]
    submitted: boolean
    updatedAt: string
}

// Database operations using MongoDB
export async function getTasks(): Promise<Task[]> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('tasks')

        const tasks = await collection.find({}).toArray()
        return tasks.map(task => ({
            _id: task._id.toString(),
            title: task.title,
            createdAt: task.createdAt
        }))
    } catch (error) {
        console.error('Error getting tasks:', error)
        return []
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function createTask(title: string): Promise<Task> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('tasks')

        const task = {
            title,
            createdAt: new Date().toISOString()
        }

        const result = await collection.insertOne(task)
        return {
            _id: result.insertedId.toString(),
            ...task
        }
    } catch (error) {
        console.error('Error creating task:', error)
        throw error
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function getDailyEntry(date: string): Promise<DailyEntryData | null> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('daily-entries')

        const entry = await collection.findOne({ date })
        if (!entry) return null

        return {
            date: entry.date,
            entries: entry.entries,
            submitted: entry.submitted,
            updatedAt: entry.updatedAt
        }
    } catch (error) {
        console.error('Error getting daily entry:', error)
        return null
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function saveDailyEntry(date: string, entries: DailyEntry[], submitted: boolean = false): Promise<DailyEntryData> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('daily-entries')

        const entry = {
            date,
            entries,
            submitted,
            updatedAt: new Date().toISOString()
        }

        await collection.updateOne(
            { date },
            { $set: entry },
            { upsert: true }
        )

        return entry
    } catch (error) {
        console.error('Error saving daily entry:', error)
        throw error
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function getEntriesForDateRange(startDate: string, endDate: string): Promise<DailyEntryData[]> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('daily-entries')

        const entries = await collection.find({
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 }).toArray()

        return entries.map(entry => ({
            date: entry.date,
            entries: entry.entries,
            submitted: entry.submitted,
            updatedAt: entry.updatedAt
        }))
    } catch (error) {
        console.error('Error getting entries for date range:', error)
        return []
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function getAllEntries(): Promise<DailyEntryData[]> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('daily-entries')

        const entries = await collection.find({}).sort({ date: -1 }).toArray()

        return entries.map(entry => ({
            date: entry.date,
            entries: entry.entries,
            submitted: entry.submitted,
            updatedAt: entry.updatedAt
        }))
    } catch (error) {
        console.error('Error getting all entries:', error)
        return []
    } finally {
        // No need to close here, client is managed globally
    }
}

// Additional MongoDB-specific functions
export async function deleteTask(taskId: string): Promise<boolean> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('tasks')

        const result = await collection.deleteOne({ _id: new ObjectId(taskId) })
        return result.deletedCount > 0
    } catch (error) {
        console.error('Error deleting task:', error)
        return false
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function updateTask(taskId: string, title: string): Promise<boolean> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const collection = database.collection('tasks')

        const result = await collection.updateOne(
            { _id: new ObjectId(taskId) },
            { $set: { title, updatedAt: new Date().toISOString() } }
        )
        return result.modifiedCount > 0
    } catch (error) {
        console.error('Error updating task:', error)
        return false
    } finally {
        // No need to close here, client is managed globally
    }
}

export async function getStats(): Promise<{
    totalTasks: number
    totalEntries: number
    averageRating: number
    mostConsistentTask: string | null
}> {
    try {
        const client = await getClient()
        const database = client.db('progress-tracker')
        const tasksCollection = database.collection('tasks')
        const entriesCollection = database.collection('daily-entries')

        const totalTasks = await tasksCollection.countDocuments()
        const totalEntries = await entriesCollection.countDocuments()

        // Calculate average rating
        const entries = await entriesCollection.find({}).toArray()
        let totalRating = 0
        let ratingCount = 0

        entries.forEach((entry: any) => {
            entry.entries.forEach((e: DailyEntry) => {
                if (e.rating > 0) {
                    totalRating += e.rating
                    ratingCount++
                }
            })
        })

        const averageRating = ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0

        // Find most consistent task (task with most entries)
        const taskStats = new Map<string, number>()
        entries.forEach((entry: any) => {
            entry.entries.forEach((e: DailyEntry) => {
                const count = taskStats.get(e.taskId) || 0
                taskStats.set(e.taskId, count + 1)
            })
        })

        let mostConsistentTask = null
        let maxCount = 0
        for (const [taskId, count] of taskStats) {
            if (count > maxCount) {
                maxCount = count
                mostConsistentTask = taskId
            }
        }

        return {
            totalTasks,
            totalEntries,
            averageRating,
            mostConsistentTask
        }
    } catch (error) {
        console.error('Error getting stats:', error)
        return {
            totalTasks: 0,
            totalEntries: 0,
            averageRating: 0,
            mostConsistentTask: null
        }
    } finally {
        // No need to close here, client is managed globally
    }
} 