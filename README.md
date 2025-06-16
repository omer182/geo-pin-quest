# 🌍 Geo Pin Quest

> **An interactive geography quiz game that challenges your world knowledge through map-based location guessing**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-API-green.svg)](https://developers.google.com/maps)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-blue.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Platform-blue.svg)](https://docker.com/)

## 🎯 About

**Geo Pin Quest** is an engaging geography learning game where players test their knowledge of world cities by placing pins on an interactive map. With a clean, minimalist design featuring vibrant country colors and intelligent zoom behavior, the game provides an educational experience that challenges players across 5 difficulty levels with progressively more challenging cities.

### ✨ Key Features

- 🗺️ **Enhanced Map Experience** - Vibrant country coloring system with 50+ unique colors and clean white borders
- 🎯 **Smart Zoom System** - Intelligent bounds-based zoom that optimally displays guess vs. actual locations
- 📊 **Optimized Progression** - 5 levels with 2000 points needed per level (reduced from 3000 for better accessibility)
- 🏆 **Precision Scoring** - Earn 0-1000 points per guess based on accuracy with enhanced proximity rewards
- 📱 **Responsive Design** - Compact card layout with smooth animations and mobile optimization
- 🎨 **Modern UI** - Dynamic city card animations and consistent styling with shadcn/ui components
- 🚀 **Production Ready** - Docker deployment with runtime API key injection for security
- 🔧 **Developer Friendly** - GitHub Actions CI/CD with multi-platform ARM64/AMD64 support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Maps API Key
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/omer182/geo-pin-quest.git
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
2. **Watch the Animation** - The city card starts centered and smoothly transitions to the top-right corner
3. **Read the Challenge** - See the city name and country you need to locate
4. **Drop Your Pin** - Click anywhere on the map to place your guess
5. **See Results** - View your accuracy and score with intelligent zoom to both locations
6. **Progress Through Levels** - Earn 2000+ points to advance to the next difficulty level (5 turns per level)

### Scoring System

- **Perfect Guess (≤25km)**: 1000 points
- **Excellent (≤50km)**: 900 points  
- **Very Good (≤100km)**: 800 points
- **Good (≤200km)**: 700 points
- **Decent (≤400km)**: 600 points
- **Average (≤600km)**: 500 points
- **Below Average (≤800km)**: 400 points
- **Poor (≤1000km)**: 300 points
- **Bad (≤1500km)**: 200 points
- **Very Bad (>1500km)**: 0-100 points

### Level Progression

- **5 turns per level** with increasing city difficulty
- **2000 points required** to advance to the next level
- **5 total levels** from world capitals to obscure Nordic towns
- **Dynamic difficulty scaling** ensures engaging progression

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
│   ├── Map.tsx         # Enhanced Google Maps with vibrant country colors & smart zoom
│   ├── GameOver.tsx    # Game over modal with try again functionality
│   ├── LevelComplete.tsx # Level completion modal with progression feedback
│   └── ui/             # shadcn/ui component library (30+ components)
├── data/
│   └── cities.ts       # 250+ cities across 5 difficulty levels
├── lib/
│   ├── geo.ts          # Geographic calculations (distance, scoring, 2000-point level system)
│   └── utils.ts        # Utility functions and class name helpers
├── pages/
│   ├── Index.tsx       # Main game interface with animated cards and Google Maps
│   └── NotFound.tsx    # 404 error page
└── hooks/              # Custom React hooks for mobile detection and toasts
```

### Key Components

- **Enhanced Map Component**: Vibrant country coloring system with 50+ unique colors, white borders, and GeoJSON data layer
- **Smart Zoom Logic**: Distance-aware zoom behavior with restricted zoom-out limits (minZoom: 2)
- **Dynamic UI Cards**: Animated city card transitions from center (130% scale) to top-right corner over 2 seconds
- **Optimized Game Logic**: 2000-point level progression system with comprehensive scoring algorithm
- **Responsive Design**: 182px width standardized cards with fixed heights for stable animations

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run build:dev    # Development build with debugging
npm run preview      # Preview production build
npm run lint         # Run ESLint with TypeScript rules

# Docker Commands
npm run docker:build # Build Docker image locally
npm run docker:run   # Run container on port 3000
npm run docker:stop  # Stop and remove container
```

### Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with React and TypeScript rules
- **Tailwind CSS**: Utility-first styling approach
- **Component Architecture**: Reusable, well-structured React components

## 🌟 Recent Major Enhancements

### Enhanced Map Experience ✅
- **Vibrant Country Coloring**: 50+ unique colors for each country using hash-based assignment
- **Clean Visual Design**: White borders (2px) with 85% color opacity for optimal country distinction  
- **Custom Map Styling**: Simplified design showing only country boundaries with clean land/water colors
- **Smart Zoom Behavior**: Distance-aware zoom with restricted zoom-out limits (minZoom: 2)
- **GeoJSON Integration**: Enhanced geometry library for accurate geographical calculations

### Optimized Game Progression ✅
- **Improved Level System**: Reduced advancement requirement from 3000 to 2000 points per level
- **Enhanced Scoring Algorithm**: 0-1000 points with precision rewards for close guesses
- **Better Accessibility**: More achievable progression while maintaining challenge
- **Comprehensive Database**: 250+ cities organized across 5 carefully curated difficulty levels

### Dynamic UI Improvements ✅  
- **Animated City Cards**: Smooth 2-second transition from center (130% scale) to top-right corner
- **Standardized Layout**: 182px width cards with fixed heights for stable animations
- **Visual Consistency**: Matching opacity levels and cohesive color scheme throughout
- **Responsive Design**: Optimized card positioning and mobile-friendly interactions

### Production & Deployment ✅
- **Docker Support**: Multi-stage build with ARM64/AMD64 support for Raspberry Pi deployment
- **Security Enhanced**: Runtime API key injection to prevent key exposure in built images
- **CI/CD Pipeline**: GitHub Actions with automated builds and registry publishing
- **Portainer Ready**: Simple container deployment with environment variable configuration

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

### Docker Deployment

The application includes a multi-stage Docker build optimized for production with runtime API key injection for security.

#### Local Docker Build

```bash
# Build the image
npm run docker:build

# Run with environment variable
docker run -p 3000:3000 -e VITE_GOOGLE_MAPS_API_KEY=your_api_key_here geo-pin-quest

# Access at http://localhost:3000
```

#### Production Docker Registry

The project uses GitHub Container Registry with automated builds:

```bash
# Pull the latest image
docker pull ghcr.io/omer182/geo-pin-quest:latest

# Run with your API key
docker run -p 3000:3000 \
  -e VITE_GOOGLE_MAPS_API_KEY=your_api_key_here \
  ghcr.io/omer182/geo-pin-quest:latest
```

### Portainer Deployment

Perfect for home servers and Raspberry Pi deployments. Add this stack configuration in Portainer:

#### Docker Compose Configuration

```yaml
version: '3.8'

services:
  geo-pin-quest:
    image: ghcr.io/omer182/geo-pin-quest:latest
    container_name: geo_pin_quest
    platform: linux/arm64  # Use linux/amd64 for x86 systems
    ports:
      - "40001:3000"  # External port 40001 maps to container port 3000
    restart: always
    environment:
      - NODE_ENV=production
      - VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
```

#### Portainer Setup Steps

1. **Log into Portainer** on your server/Raspberry Pi
2. **Go to Stacks** → **Add Stack**
3. **Name**: `geo-pin-quest`
4. **Paste the Docker Compose** configuration above
5. **Replace** `your_actual_google_maps_api_key` with your real API key
6. **Deploy the Stack**
7. **Access** your game at `http://your-server-ip:40001`

#### Security Features

- ✅ **Runtime API Key Injection**: API key is injected at container startup, not baked into the image
- ✅ **Multi-Platform Support**: ARM64 for Raspberry Pi, AMD64 for standard servers
- ✅ **Health Checks**: Built-in container health monitoring
- ✅ **Optimized Caching**: GitHub Actions cache for faster builds

### Traditional Hosting

#### Build for Static Hosting

```bash
# Production build
npm run build

# The dist/ folder contains the built application
# Deploy the contents to your preferred hosting service
```

#### Hosting Options

- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Simple drag-and-drop or Git integration  
- **GitHub Pages**: Free hosting for static sites
- **AWS S3 + CloudFront**: Scalable cloud hosting
- **Raspberry Pi + Nginx**: Self-hosted solution

## 🔮 Future Enhancements

### Planned Features
- [ ] User authentication and progress saving with local storage
- [ ] Multiplayer mode with real-time competition and leaderboards
- [ ] Additional geography challenges (flags, capitals, landmarks, rivers)
- [ ] Statistics dashboard with detailed analytics and performance tracking
- [ ] Achievement system and badges for various milestones
- [ ] Custom map themes and visual options (satellite, terrain)
- [ ] Offline mode with service worker for PWA functionality

### Technical Improvements
- [ ] Comprehensive testing suite (Jest/Vitest, React Testing Library, E2E tests)
- [ ] Advanced error boundary implementation with error reporting
- [ ] Performance monitoring and analytics integration
- [ ] Internationalization support for multiple languages
- [ ] Advanced mobile optimizations and touch gesture support
- [ ] Enhanced accessibility features (keyboard navigation, screen readers)
- [ ] Code splitting and lazy loading for improved performance

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
- **shadcn/ui** for the beautiful and accessible component library
- **Lucide React** for the clean, modern icon system
- **React Community** for the excellent ecosystem and development tools
- **Vite** for the lightning-fast build tool and development experience
- **Tailwind CSS** for the utility-first styling approach

---

<div align="center">

**Built with ❤️ for geography enthusiasts worldwide**

[🌍 Play Now](https://your-deployment-url.com) • [📖 Documentation](./docs/overview.md) • [🐛 Report Bug](https://github.com/omer182/geo-pin-quest/issues) • [🐳 Docker Hub](https://github.com/omer182/geo-pin-quest/pkgs/container/geo-pin-quest)

</div>