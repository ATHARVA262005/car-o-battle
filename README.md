# CAR O BATTLE 🚗💥

A real-time multiplayer top-down battle royale game built with React and Socket.IO. Fight for survival in an endless world filled with obstacles, enemy AI cars, and power-ups!

## 🎮 Game Features

### Core Gameplay
- **Multiplayer Combat**: Up to 100 players in real-time battles
- **Endless World**: Procedurally generated terrain with ruins and obstacles
- **Lives System**: Each player starts with 3 lives
- **Fuel Management**: Collect fuel tanks to keep your car running
- **Power-up System**: 8 different power-ups with unique abilities
- **Enemy AI**: Intelligent enemy cars that hunt and attack players

### Power-ups
- **Speed Boost** 🟡: Increased movement speed (10s)
- **Health Pack** 🟢: Instant health restoration
- **Damage Boost** 🔴: Increased projectile damage (15s)
- **Rapid Fire** 🟠: Faster shooting rate (12s)
- **Shield** 🔵: Temporary protection (8s)
- **Multi-Shot** 🟣: Shoot 3 projectiles at once (10s)
- **Explosive** 🔴: Explosive projectiles (8s)
- **Invisibility** ⚫: Temporary stealth (6s)

### World Elements
- **Procedural Generation**: Seeded world generation for consistent terrain
- **Obstacles**: Ruins and junk that block movement
- **Fuel Tanks**: Scattered throughout the world for refueling
- **Enemy Cars**: Green and slate AI-controlled vehicles

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd boatowaepon
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

### Running the Game

1. **Start the server**
```bash
cd server
npm start
```
Server runs on `http://localhost:3001`

2. **Start the client** (in a new terminal)
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🎯 How to Play

### Controls
- **WASD / Arrow Keys**: Move your car
- **Space**: Shoot projectiles
- **Shift**: Sprint (faster movement, consumes more fuel)
- **Ctrl**: Handbrake (sharp turns, more friction)
- **1-8**: Use power-ups from inventory slots
- **ESC**: Pause/Resume game

### Objective
- Survive as long as possible by eliminating other players and AI enemies
- Collect fuel tanks to prevent running out of fuel
- Gather power-ups to gain tactical advantages
- Avoid obstacles and enemy fire
- Score points by eliminating enemies and surviving over time

### Scoring System
- **+100 points**: Eliminate another player
- **+150 points**: Destroy an enemy AI car
- **+100 points**: Eliminate enemy through collision
- **+2 points**: Survival bonus every 5 seconds

## 🛠️ Technical Stack

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Socket.IO Client**: Real-time communication
- **Framer Motion**: Animations
- **React Icons**: UI icons

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **Socket.IO**: Real-time bidirectional communication
- **ES Modules**: Modern JavaScript module system

### Game Engine Features
- **60 FPS Game Loop**: Smooth real-time updates
- **Client-side Prediction**: Responsive movement
- **Interpolation**: Smooth player movement
- **Collision Detection**: Physics-based interactions
- **Chunk-based World Generation**: Efficient infinite world

## 🎨 Game Assets

The game includes pixel art assets for:
- Player and enemy vehicles
- Environmental textures (grass, ruins, junk)
- UI elements (hearts, fuel tanks)
- Background music and sound effects

## 🔧 Configuration

### Server Configuration
- **Max Players**: 100 (configurable in `server.js`)
- **World Seed**: 12345 (for consistent world generation)
- **Game Loop**: 60 FPS update rate

### Client Configuration
- **Canvas Rendering**: Hardware-accelerated 2D graphics
- **Audio System**: Background music with volume controls
- **Responsive Design**: Adapts to different screen sizes

## 🐛 Known Issues

Based on the code review, there are several areas for improvement:
- CSRF protection needed for API endpoints
- Error handling could be enhanced
- Performance optimizations for large player counts
- Code maintainability improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source. Please check the license file for details.

## 🎵 Audio Credits

Background music tracks are hosted externally and include:
- Highway Skirmish
- Highway Duel
- Bubble pop sound effects

---

**Ready to battle?** Start your engines and may the best driver survive! 🏁