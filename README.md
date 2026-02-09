# Gym Progress Tracker MVP

A full-stack web application for tracking gym workouts and progress.

## Features

### Core Features
- **Exercise Tracking**: Log exercises with weight, sets, reps, and timestamp
- **Workout Sessions**: Group exercises into named workout sessions with date tracking
- **Real-time Search**: Filter exercises by name with autocomplete suggestions
- **Calendar View**: Visual calendar showing workout days with click-to-view details
- **Workout Templates**: Save and reuse workout patterns for quick workout setup

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Deployment**: Railway or Docker

## Getting Started

### Prerequisites
- Node.js 18+ (Node.js 20 recommended)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SimpleGymTracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Development Features

- Hot reload with Next.js dev server
- Database automatically initializes on first run
- SQLite database stored as `gym-tracker.db` in project root

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── exercises/search/   # Exercise search endpoint
│   │   ├── workouts/           # Workout CRUD endpoints
│   │   └── templates/          # Template CRUD endpoints
│   ├── layout.tsx              # Root layout with navbar
│   ├── globals.css             # Global styles
│   └── page.tsx                # Dashboard/home page
│   └── templates/page.tsx      # Templates management page
├── components/
│   ├── Calendar.tsx            # Interactive calendar component
│   ├── ExerciseForm.tsx        # Exercise input form
│   ├── NavBar.tsx              # Navigation bar
│   ├── SearchExercises.tsx     # Exercise search component
│   ├── WorkoutDetail.tsx       # Workout display component
│   └── WorkoutForm.tsx         # Workout creation form
└── lib/
    ├── db.ts                   # Database initialization
    └── types.ts                # TypeScript types
```

## API Endpoints

### Workouts
- `GET /api/workouts` - Get all workouts (optionally filtered by date)
- `GET /api/workouts/:id` - Get single workout with exercises
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get single template
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Exercises
- `GET /api/exercises/search?q=query` - Search exercises by name

## Data Models

### Workout Session
```typescript
{
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  created_at: string; // ISO timestamp
  exercises?: Exercise[];
}
```

### Exercise Log
```typescript
{
  id: string;
  workout_id: string;
  exercise_name: string;
  weight: number;
  sets: number;
  reps: number;
  order_index: number;
  created_at: string;
}
```

### Template
```typescript
{
  id: string;
  name: string;
  created_at: string;
  exercises?: TemplateExercise[];
}
```

### Template Exercise
```typescript
{
  id: string;
  template_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  order_index: number;
}
```

## Usage Guide

### Logging a Workout

1. **From Dashboard**: Fill in the workout title and select a date
2. **Add Exercises**: Use the exercise form to add exercises by searching or typing names
3. **Pre-populate Info**: Sets and reps default to 3×8, adjust as needed
4. **Save**: Click "Save Workout" to log the session

### Using Templates

1. **Save Template**: After adding exercises, click "Save as Template"
2. **Name Template**: Give it a memorable name (e.g., "Push Day")
3. **Load Template**: Click "Load Template" button to view saved templates
4. **Use Template**: Click a template to auto-fill exercises

### Viewing Workouts

1. **Calendar**: Click any date with a green dot indicator
2. **Details**: View all exercises and times logged for that date
3. **Delete**: Remove workouts by clicking the delete button

### Searching Exercises

- **Real-time**: Start typing to see suggestions
- **Examples**: "Bench", "Lateral", "Squat" will show matching exercises
- Exercise library builds automatically from your logged exercises

## Building for Production

### Build the application
```bash
npm run build
```

### Start production server
```bash
npm start
```

## Deployment

### Railway Deployment

1. **Connect Repository**: Link your GitHub repo to Railway
2. **Deploy**: Railway will automatically detect and deploy
3. **Configure**: Set `NODE_ENV=production` in Railway dashboard

### Docker Deployment

```bash
# Build image
docker build -t gym-tracker .

# Run container
docker run -p 3000:3000 gym-tracker
```

### Environment Variables
- `NODE_ENV=production` (for production)

## Database

### Local Development
- SQLite database (`gym-tracker.db`) is created automatically
- Located in the project root directory
- Includes `.db-wal` and `.db-shm` temp files

### Data Backup
The SQLite database is persisted, so data survives application restarts.

## Performance Optimizations

- **Indexed Queries**: Database indices on commonly queried fields
- **Client-side Search**: Exercise suggestions cached on client
- **Debounced Search**: 300ms debounce on exercise search
- **WAL Mode**: SQLite Write-Ahead Logging enabled for better concurrency

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- User authentication and multi-user support
- Exercise history and progressions graphs
- Body weight tracking
- Mobile app with offline support
- Workout statistics and analytics
- Social features (friend workouts, challenges)

## Troubleshooting

### Database locked error
- Restart the development server
- Ensure no other instances are running

### API errors
- Check browser console for detailed error messages
- Verify database file is readable/writable in project root

### Import errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm ci`
- Restart dev server

## License

MIT
