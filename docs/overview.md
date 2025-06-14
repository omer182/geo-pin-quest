# Project Overview

## Purpose

**Geo Pin Quest** is an interactive geography quiz game built as a React web application featuring a level-based endless progression system. The game challenges players to guess the locations of famous cities around the world by dropping pins on a clean, minimalist Google Maps interface. Players advance through levels by meeting point thresholds, creating an engaging educational experience that tests geographical knowledge with increasing difficulty.

**Recent Major Updates:**
- **Enhanced Map Experience**: Simplified map styling showing only country boundaries with clean land/water colors
- **Intelligent Zoom Behavior**: Smart bounds-based zoom that optimally displays both guess and answer locations
- **Streamlined UI**: Compact result card design that doesn't obstruct the map view
- **Performance Optimizations**: Improved map rendering and interaction responsiveness

## Key Libraries

### Frontend Framework & Tooling
- **React 18.3.1** - Core UI framework
- **TypeScript 5.5.3** - Type safety and development experience
- **Vite 5.4.1** - Build tool and development server
- **React Router DOM 6.26.2** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - Pre-built component library based on Radix UI primitives
- **Radix UI** - Comprehensive set of accessible UI components
- **Lucide React** - Icon library
- **next-themes** - Theme management

### Maps & Geolocation
- **@react-google-maps/api 2.20.6** - Google Maps integration for React with geometry library
- **Custom Map Styling** - Simplified visual design showing only country boundaries
- **Intelligent Zoom System** - Dynamic bounds-based zoom with distance-aware padding
- **@types/mapbox-gl** - Type definitions (legacy, not actively used)

### State Management & Data Fetching
- **@tanstack/react-query 5.56.2** - Server state management and caching
- **React Hook Form 7.53.0** - Form state management
- **@hookform/resolvers 3.9.0** - Form validation resolvers

### Validation & Utilities
- **Zod 3.23.8** - Schema validation
- **clsx & tailwind-merge** - Conditional CSS class utilities
- **date-fns 3.6.0** - Date manipulation utilities

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **lovable-tagger** - Development-mode component tagging

## File Structure

```
/
├── public/              # Static assets (favicon, robots.txt)
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Map.tsx      # Enhanced Google Maps with clean styling & smart zoom
│   │   ├── GameOver.tsx # Game over modal component
│   │   ├── LevelComplete.tsx # Level completion modal component
│   │   └── ui/          # shadcn/ui component library
│   ├── data/            # Static data and constants
│   │   └── cities.ts    # 250+ cities organized by 5 difficulty levels
│   ├── hooks/           # Custom React hooks
│   │   ├── use-mobile.tsx   # Mobile device detection
│   │   └── use-toast.ts     # Toast notification management
│   ├── lib/             # Utility functions and helpers
│   │   ├── geo.ts       # Geographical calculations (distance, 0-1000 point scoring)
│   │   └── utils.ts     # General utility functions
│   ├── pages/           # Page components
│   │   ├── Index.tsx    # Main game page with Google Maps
│   │   └── NotFound.tsx # 404 error page
│   ├── App.tsx          # Root application component
│   └── main.tsx         # Application entry point
├── docs/                # Project documentation
└── Configuration files  # Vite, TypeScript, Tailwind, ESLint configs
```

## Startup & Runtime

### Development
```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev
```

### Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Build in development mode (for debugging)
npm run build:dev
```

### Key Commands
- `npm run dev` - Starts Vite development server on port 8080
- `npm run build` - Creates optimized production build
- `npm run lint` - Runs ESLint code analysis
- `npm run preview` - Serves the production build locally

## Database

**No database is used in this project.** The application is entirely client-side with static data:

- City information is stored in `src/data/cities.ts` as a hardcoded array of 250+ cities organized by 5 difficulty levels
- Game state is managed in React component state including level progression, scoring, and modal states
- No persistence between sessions - scores and progress are lost on page refresh

## Migrations

**Not applicable** - No database or data persistence layer exists.

## Testing

**No testing framework is currently configured.** The project lacks:
- Unit tests
- Integration tests  
- End-to-end tests
- Testing scripts in package.json

This represents a significant gap for a production application.

## Environment Variables

**Environment variables are implemented** for API configuration:

- **Google Maps API Key**: Stored in `.env` file as `VITE_GOOGLE_MAPS_API_KEY`
- **Build configuration**: Managed through Vite config files
- **`.env` file**: Required for Google Maps integration

### Configuration Management
The project uses Vite's built-in environment variable system with proper `.env` file support. The Google Maps API key is required for the map functionality to work properly.

## API (Swagger/OpenAPI)

**No API documentation exists.** The application is primarily client-side with minimal external dependencies:
- No OpenAPI/Swagger specifications
- No backend API endpoints
- Primary external dependency is Google Maps API for map rendering

## Processes & Gotchas

### Google Maps Setup
1. **Critical**: Set `VITE_GOOGLE_MAPS_API_KEY` environment variable with a valid Google Maps API key
2. **APIs Required**: Enable Google Maps JavaScript API and Geometry Library in Google Cloud Console
3. **Billing**: Google Maps API requires billing account setup
4. **Enhanced Styling**: Clean map design with only country boundaries visible for focused geography learning
5. **Smart Zoom**: Automatic bounds-based zoom that adapts to guess-answer distance relationships

### Map Features & Optimizations
- **Simplified Visual Design**: Only country boundaries shown with clean land (#f5f5dc) and water (#4682b4) colors
- **Intelligent Zoom Behavior**: Dynamic padding based on distance between guess and answer points
- **Performance Optimized**: Geometry library integration for accurate distance calculations
- **UI Integration**: Compact result card (55% width) positioned to not obstruct map view
- **Accessibility**: High contrast country borders (#333333) for better visibility

### Development Setup
1. Uses port 8080 by default (configured in `vite.config.ts`)
2. Path aliases configured: `@/` maps to `src/` directory
3. Hot module replacement enabled for fast development
4. Requires valid Google Maps API key for map functionality

### Game Logic & Architecture
- **Level System**: 5 turns per level, 3000 points needed to advance
- **Scoring Algorithm**: 0-1000 points per guess based on distance accuracy
- **City Database**: 250+ cities across 5 difficulty levels with increasing challenge
- **Game Flow**: Level progression with GameOver and LevelComplete modals
- **Enhanced Map Interactions**: 
  - Click-based pin placement with visual feedback
  - Smart zoom to optimal view of guess-answer relationship
  - Clean map reset after each turn
  - Distance-aware zoom padding for better user experience
- **Responsive Design**: Compact result card that adapts to different screen sizes

## TODOs

### Critical Missing Features
1. **Testing Suite**: Add Jest/Vitest, React Testing Library, and E2E tests
2. **Error Boundaries**: Add React error boundaries for better error handling
3. **Data Persistence**: Consider adding local storage for high scores and level progress
4. **Mobile Optimization**: Enhance touch interactions for mobile Google Maps (current design is mobile-friendly)

### Code Quality Improvements
1. **Type Safety**: Add stricter TypeScript configuration
2. **Performance**: Implement React.memo for expensive components (Map component already optimized)
3. **Accessibility**: Audit and improve keyboard navigation and screen reader support
4. **Map Performance**: Already optimized with geometry library and smart zoom behavior

### Architecture Enhancements
1. **State Management**: Consider Zustand or Redux for complex game state management
2. **Code Splitting**: Implement lazy loading for components
3. **PWA Features**: Add service worker for offline capability
4. **Google Maps Features**: Consider adding additional geography learning features (country info, statistics)

### Documentation Gaps
1. **Component Documentation**: Add JSDoc comments to components
2. **Google Maps Integration**: Document enhanced map styling and zoom behavior implementation
3. **Deployment Guide**: Add comprehensive deployment instructions
4. **Environment Setup**: Add detailed Google Maps API setup guide
5. **UI/UX Guidelines**: Document the clean design principles and responsive behavior

### Security & Performance
1. **Bundle Analysis**: Monitor bundle size and performance
2. **API Key Security**: Ensure proper Google Maps API key management
3. **Error Handling**: Implement graceful fallbacks for Google Maps failures
4. **Performance Monitoring**: Add performance tracking and metrics
5. **Map Optimization**: Already implemented with geometry library and optimized zoom behavior

### Recent Improvements Completed ✅
- **Enhanced Map Styling**: Removed all unnecessary visual elements, showing only clean country boundaries
- **Smart Zoom System**: Implemented distance-aware zoom with optimal padding for guess-answer visualization
- **Compact UI Design**: Reduced result card size by 45% with better positioning
- **Performance Optimizations**: Added geometry library for accurate distance calculations
- **Clean Visual Design**: Implemented minimalist color scheme for focused geography learning
