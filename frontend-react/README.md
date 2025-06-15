# The Office - React Frontend

This is a React TypeScript conversion of the original HTML/JavaScript office viewer. The application provides an interactive 2D office environment with animated characters, chat functionality, and real-time character movement.

## 🚀 Features

- **Interactive Office Environment**: 2D office map with multiple departments
- **Animated Characters**: 4 office roles (CEO, Developer, HR, Manager) with smooth movement
- **Real-time Chat System**: Communicate with office agents
- **Character Selection**: Click on characters to interact with them
- **Visual Controls**: Toggle grid, boundaries, and character visibility
- **Responsive Design**: Adapts to different screen sizes

## 🏗️ Architecture

The application is built with a clean React architecture:

### 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Controls.tsx     # Game control buttons
│   ├── Chat.tsx         # Chat interface
│   └── OfficeCanvas.tsx # Main canvas renderer
├── hooks/               # Custom React hooks
│   ├── useAssets.ts     # Asset loading management
│   ├── useGameState.ts  # Game state management
│   └── useChat.ts       # Chat system logic
├── classes/             # TypeScript classes
│   └── OfficeCharacter.ts # Character behavior and rendering
├── constants/           # Application constants
│   └── index.ts         # Office roles and configurations
├── types/              # TypeScript interfaces
│   └── index.ts         # Type definitions
└── App.tsx             # Main application component
```

### 🎯 Key Components

1. **OfficeCanvas**: Handles canvas rendering, character animation, and game loop
2. **Controls**: Manages user interface controls for game settings
3. **Chat**: Provides real-time chat functionality with agents
4. **OfficeCharacter**: Encapsulates character behavior, movement, and AI

### 🔧 Custom Hooks

- `useAssets`: Manages loading of map data, spritesheets, and character assets
- `useGameState`: Controls game settings like visibility toggles and character selection
- `useChat`: Handles chat messages and agent responses

## 🎮 Office Roles

The office includes 4 distinct roles, each with their own designated areas:

- **🤵 CEO**: Corner office (Gold color)
- **💻 Developer**: Development area (Green color)  
- **👔 HR**: HR department (Pink color)
- **📊 Manager**: Management zone (Orange color)

Each character has unique movement patterns and personality traits.

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 🎨 Assets

The application requires these assets in the `public/` folder:
- `map.json`: Office layout and tile mapping
- `spritesheet.png`: Tile graphics for the office environment
- `Characters.png`: Character sprites and animations

## 🔧 Configuration

### Character Configuration
Characters are configured in `src/constants/index.ts`:
- Movement boundaries
- Desk locations
- Animation frames
- Personality traits

### Game Settings
Default game settings can be modified in `src/constants/index.ts`:
- Display options
- Animation settings
- Character speed
- Zoom levels

## 🌐 Backend Integration Ready

The React frontend is designed to easily integrate with a backend API:

### Chat System
- Modular chat hook (`useChat`) for easy API integration
- Message formatting ready for WebSocket or REST API
- Agent response system ready for AI integration

### Character Management
- Character state management ready for multiplayer
- Movement synchronization prepared for real-time updates
- Character actions ready for backend processing

### Game State
- Centralized state management via React hooks
- Easy integration with state management libraries (Redux, Zustand)
- API-ready data structures

## 🔄 Converting from HTML

This React version maintains all functionality from the original HTML version:

### ✅ Preserved Features
- Canvas-based rendering with HTML5 Canvas API
- Character animation and movement systems
- Chat interface with agent responses
- Visual controls and settings
- Responsive design

### 🚀 Improvements
- **TypeScript**: Full type safety and better development experience
- **Modular Architecture**: Clean separation of concerns
- **React Hooks**: Modern state management patterns
- **Component Reusability**: Easily extensible and maintainable
- **Backend Ready**: Prepared for API integration

## 🎯 Usage

1. **Character Interaction**: Click on character buttons to select and interact with office agents
2. **Chat**: Type messages in the chat input to communicate with agents
3. **Visual Controls**: Use toggle buttons to show/hide grid, characters, and boundaries
4. **Office Exploration**: Watch characters move around their designated office areas

## 🔧 Development

### Running Tests
```bash
npm test
```

### Code Quality
The project uses TypeScript for type safety and follows React best practices:
- Functional components with hooks
- Custom hooks for logic separation
- Clean component architecture
- Type-safe prop interfaces

### Performance
- Canvas rendering optimized with `requestAnimationFrame`
- Asset loading with proper error handling
- Efficient re-rendering with React.memo and useCallback
- Smooth character animations with easing functions

## 🚀 Deployment

The application can be deployed to any static hosting service:

```bash
npm run build
# Deploy the 'build' folder to your hosting service
```

Popular deployment options:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Contributing

The codebase is well-structured for contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes with TypeScript
4. Ensure tests pass
5. Submit a pull request

## 📄 License

This project maintains the same license as the original codebase.

---

**Ready for Backend Integration!** This React frontend provides a solid foundation for integrating with your backend API, supporting real-time features, user management, and AI-powered agent interactions.
