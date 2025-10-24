# NFL Pick'em App - AI Coding Instructions

## Project Overview
Single-page React app for managing NFL weekly pick'em games. Built with Vite + React + TailwindCSS, featuring real-time score updates from ESPN API and session storage persistence.

## Architecture & Data Flow
- **Single Component Design**: Everything lives in `App.jsx` (~800+ lines) - intentionally monolithic for simplicity
- **State Management**: React hooks with session storage persistence (no external state library)
- **Data Persistence**: Session storage with automatic save/load, export/import JSON functionality
- **External API**: ESPN NFL Scoreboard API for live score updates with comprehensive team name normalization

## Key State Structure
```javascript
// Core entities
games: [{ id, awayTeam, homeTeam, day, time, winner, homeScore, awayScore, status }]
players: [{ id, name, picks: {gameId: teamName}, tiebreaker }] 
activePlayer: playerId // Current player making picks
```

## Critical Patterns

### Team Name Normalization
The `normalizeTeamName()` function maps ESPN API names to pick sheet names (e.g., "Pittsburgh Steelers" → "Pittsburgh"). This mapping is essential for score matching and frequently needs updates for new team variations.

### Dual Admin/User Modes
- `isAdminMode: true` → Setup screen for file uploads
- `isAdminMode: false` → Main pick'em interface
- `showAdmin` → Toggle admin panel for manual winner updates

### File Processing Pattern
Text file uploads parse games using regex patterns for "Team at/vs Team Time" format. The parser extracts week numbers, team names, and game times from structured text files.

### Session Storage Strategy
Each state change auto-saves to session storage with error handling for quota exceeded. Export/import provides backup/restore functionality.

## Development Workflows

### Local Development
```bash
npm run dev      # Starts on http://localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

### Testing Score Updates
Use "Update Scores" button to test ESPN API integration. Check browser console for team matching logs - failed matches need team name mapping updates.

### File Upload Testing
Create test pick sheets with format:
```
WEEK 7
Sunday
Team1 at Team2 1:00pm
Monday  
Team3 vs Team4 8:15pm
```

## Component Structure
- Header: Week info, action buttons, player tabs
- Setup Screen: File upload, data management (admin mode)
- Game Grid: Organized by day, shows pick status with color coding
- Leaderboard: Live scoring with correct/incorrect/pending counts
- Admin Panel: Manual winner selection (toggle via showAdmin)

## Styling Conventions
- TailwindCSS with utility-first approach
- Responsive grid: `lg:col-span-2` for main area, `lg:col-span-1` for sidebar
- Status colors: Green (correct), Red (incorrect), Yellow (pending), Gray (default)
- Button patterns: `px-4 py-2 bg-{color}-600 text-white rounded-lg hover:bg-{color}-700`

## Configuration Management
ESPN API settings are configurable via admin setup:
- **Week Number**: Current NFL week (1-18 for regular season)
- **Year**: NFL season year
- **Season Type**: 1=Preseason, 2=Regular Season, 3=Postseason  
- **ESPN API URL**: Base URL for score fetching (configurable for different sports/leagues)

## External Dependencies
- **Lucide React**: Icons throughout the UI
- **ESPN API**: Configurable URL, defaults to NFL scoreboard (no auth required)

## Common Modifications
- Update team name mappings in `normalizeTeamName()` for new ESPN variations
- Modify game parsing regex in `handleTextFileUpload()` for different file formats  
- Configure ESPN API parameters via admin UI or adjust URL for different sports
- Add new game status handling in score update logic

## Deployment
- **Target Platform**: GitHub Pages (static hosting)
- **Build Output**: Standard Vite build generates static files for hosting
- **No Backend Required**: Pure client-side app with session storage persistence

## Performance Notes
- Single component keeps bundle small and eliminates prop drilling
- Session storage auto-save can be intensive - consider debouncing for large datasets
- ESPN API calls are throttled client-side, no rate limiting on their end observed