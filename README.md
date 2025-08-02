# Progress Tracker - Personal Productivity PWA

A clean, minimal, dark-themed Progressive Web App (PWA) dashboard for tracking personal productivity and daily progress.

## Features

### 📝 Daily Entry Page
- Track daily tasks with 1-5 star ratings
- Add optional notes for each task
- Auto-save functionality
- Add new tasks to your tracking list
- Submit once per day with persistent data

### 📅 Calendar View
- Monthly calendar with color-coded daily ratings
- Click any day to view detailed entries
- Visual progress tracking over time
- Heat map showing your performance patterns

### 📊 Reports & Analytics
- Weekly/monthly trends and insights
- Task performance analysis
- Consistency tracking
- Best/worst day identification
- Export data to CSV format
- Filter by time periods (week/month/year)

### ⚙️ Settings & PWA Features
- Push notification configuration
- Daily reminder scheduling (8 PM default)
- Backup and restore functionality
- PWA installation support
- Offline capability
- Dark theme optimized

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with Radix UI patterns
- **PWA**: Service Worker, Web App Manifest
- **Storage**: LocalStorage (with MongoDB Atlas ready)
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-progress-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### PWA Installation

1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the install prompt or use the browser's install option
3. The app will be added to your home screen/desktop
4. Enjoy offline functionality and native app experience

## Usage

### Daily Tracking
1. Navigate to "Daily Entry" from the dashboard
2. Rate each task from 1-5 stars
3. Add optional notes for context
4. Submit your daily entry (once per day)
5. Changes are auto-saved as you type

### Calendar View
1. Go to "Calendar View" to see your monthly progress
2. Days are color-coded based on average ratings:
   - Green: 4-5 stars (Excellent)
   - Yellow: 3 stars (Good)
   - Orange: 2 stars (Fair)
   - Red: 1 star (Needs improvement)
3. Click any day to view detailed entries

### Analytics
1. Visit "Reports" for detailed insights
2. View overall statistics and trends
3. Identify your most consistent tasks
4. Export data for external analysis
5. Filter by different time periods

### Settings
1. Configure push notifications
2. Set reminder times
3. Export/import your data
4. Install as PWA
5. Manage app preferences

## Data Structure

### Tasks
```typescript
interface Task {
  _id: string
  title: string
  createdAt: string
}
```

### Daily Entries
```typescript
interface DailyEntry {
  date: string
  entries: {
    taskId: string
    rating: number
    note: string
  }[]
  submitted: boolean
  createdAt: string
  updatedAt: string
}
```

## PWA Features

- **Offline Support**: Works without internet connection
- **Push Notifications**: Daily reminders at 8 PM
- **Installable**: Add to home screen/desktop
- **Responsive**: Optimized for mobile and desktop
- **Fast Loading**: Cached resources for quick access

## Browser Support

- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] MongoDB Atlas integration
- [ ] User authentication
- [ ] Data synchronization across devices
- [ ] Advanced analytics and charts
- [ ] Task categories and tags
- [ ] Goal setting and tracking
- [ ] Social sharing features
- [ ] API for third-party integrations

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
