# 🌍 Geo Pin Quest

> **An interactive geography quiz game that challenges your world knowledge through map-based location guessing**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-API-green.svg)](https://developers.google.com/maps)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-blue.svg)](https://tailwindcss.com/)

## 🎯 About

**Geo Pin Quest** is an engaging geography learning game where players test their knowledge of world cities by placing pins on an interactive map. With a clean, minimalist design and intelligent zoom behavior, the game provides an educational experience that challenges players across 5 difficulty levels.

### ✨ Key Features

- 🗺️ **Clean Map Interface** - Simplified Google Maps with only country boundaries visible
- 🎯 **Smart Zoom System** - Intelligent bounds-based zoom that optimally displays guess vs. actual locations
- 📊 **Progressive Difficulty** - 5 levels with 250+ cities from around the world
- 🏆 **Score-Based Progression** - Earn 0-1000 points per guess based on accuracy
- 📱 **Responsive Design** - Optimized for both desktop and mobile play
- 🎨 **Modern UI** - Clean interface built with shadcn/ui components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Maps API Key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd geo-pin-quest

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google Maps API key to .env file
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Required Google Cloud APIs:**
- Google Maps JavaScript API
- Google Maps Geometry Library

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:8080 in your browser
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Play

1. **Start the Game** - Click "Start Game" to begin your geography adventure
2. **Read the Challenge** - See the city name and country you need to locate
3. **Drop Your Pin** - Click anywhere on the map to place your guess
4. **See Results** - View your accuracy and score, with both locations highlighted
5. **Progress Through Levels** - Earn 3000+ points to advance to the next difficulty level

### Scoring System

- **Perfect Guess (0km)**: 1000 points
- **Very Close (<100km)**: 800-999 points  
- **Good Guess (<500km)**: 500-799 points
- **Decent Attempt (<1000km)**: 200-499 points
- **Far Off (>1000km)**: 0-199 points

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: Google Maps JavaScript API
- **State Management**: React hooks
- **Routing**: React Router DOM

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Map.tsx         # Enhanced Google Maps with smart zoom
│   ├── GameOver.tsx    # Game over modal
│   ├── LevelComplete.tsx # Level completion modal
│   └── ui/             # shadcn/ui component library
├── data/
│   └── cities.ts       # 250+ cities across 5 difficulty levels
├── lib/
│   ├── geo.ts          # Geographic calculations
│   └── utils.ts        # Utility functions
├── pages/
│   ├── Index.tsx       # Main game interface
│   └── NotFound.tsx    # 404 page
└── hooks/              # Custom React hooks
```

### Key Components

- **Map Component**: Clean Google Maps integration with simplified styling
- **Game Logic**: Level-based progression with score tracking
- **Smart Zoom**: Distance-aware zoom behavior for optimal result viewing
- **Responsive UI**: Compact result cards that don't obstruct the map

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with React and TypeScript rules
- **Tailwind CSS**: Utility-first styling approach
- **Component Architecture**: Reusable, well-structured React components

## 🌟 Recent Enhancements

### Map Improvements
- ✅ Removed visual clutter (grid lines, labels, unnecessary elements)
- ✅ Clean country boundaries with simple land/water colors
- ✅ Smart zoom behavior based on guess-answer distance
- ✅ Geometry library integration for accurate calculations

### UI/UX Enhancements  
- ✅ Compact result card (45% size reduction)
- ✅ Better positioning to avoid map obstruction
- ✅ Improved mobile responsiveness
- ✅ Enhanced visual feedback

## 📝 API Requirements

### Google Maps Setup

1. **Create a Google Cloud Project**
2. **Enable APIs**:
   - Google Maps JavaScript API
   - Google Maps Geometry Library
3. **Create API Key** with appropriate restrictions
4. **Set up Billing** (required for Google Maps)

### Environment Configuration

```env
# Required
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional build configuration
VITE_BUILD_MODE=production
```

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# The dist/ folder contains the built application
# Deploy the contents to your preferred hosting service
```

### Hosting Options

- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Simple drag-and-drop or Git integration
- **GitHub Pages**: Free hosting for static sites
- **AWS S3 + CloudFront**: Scalable cloud hosting

## 🔮 Future Enhancements

### Planned Features
- [ ] User authentication and progress saving
- [ ] Multiplayer mode with real-time competition
- [ ] Additional geography challenges (flags, capitals, landmarks)
- [ ] Statistics dashboard with detailed analytics
- [ ] Achievement system and badges
- [ ] Custom map themes and visual options

### Technical Improvements
- [ ] Comprehensive testing suite (Jest, React Testing Library)
- [ ] PWA features for offline gameplay
- [ ] Performance monitoring and analytics
- [ ] Advanced error boundary implementation
- [ ] Internationalization support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps API** for providing the interactive mapping functionality
- **shadcn/ui** for the beautiful component library
- **Lucide React** for the clean, modern icons
- **React Community** for the excellent ecosystem and tools

---

<div align="center">

**Built with ❤️ for geography enthusiasts worldwide**

[🌍 Play Now](https://your-deployment-url.com) • [📖 Documentation](./docs/overview.md) • [🐛 Report Bug](https://github.com/your-username/geo-pin-quest/issues)

</div>