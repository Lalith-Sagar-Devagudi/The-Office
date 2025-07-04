import React from 'react';
import './App.css';
import { useAssets } from './hooks/useAssets';
import { useGameState } from './hooks/useGameState';
import { useChat } from './hooks/useChat';
import { Controls } from './components/Controls';
import { Chat } from './components/Chat';
import { OfficeCanvas } from './components/OfficeCanvas';

function App() {
  const { mapData, spriteSheet, characterSheet, loading, error } = useAssets();
  const {
    gameState,
    toggleGrid,
    toggleCharacters,
    toggleBoundaries,
    selectCharacter
  } = useGameState();
  const { messages, sendMessage, addAgentMessage, isLoading } = useChat();

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>🏢 The Office</h1>
        </div>
        <div className="info">
          <div className="loading">Loading office environment...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>🏢 The Office</h1>
        </div>
        <div className="error">
          <h3>Error Loading Office Environment</h3>
          <p>Could not load required files:</p>
          <ul>
            <li>map.json</li>
            <li>spritesheet.png</li>
            <li>Characters.png</li>
          </ul>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleCharacterSelect = (role: string) => {
    selectCharacter(role);
  };

  const handleAddChatMessage = (sender: string, message: string) => {
    addAgentMessage(sender, message);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🏢 The Office</h1>
      </div>

      <Controls
        gameState={gameState}
        onToggleGrid={toggleGrid}
        onToggleCharacters={toggleCharacters}
        onToggleBoundaries={toggleBoundaries}
        onSelectCharacter={handleCharacterSelect}
      />

      <div className="main-content">
        {mapData && spriteSheet && characterSheet && (
          <OfficeCanvas
            mapData={mapData}
            spriteSheet={spriteSheet}
            characterSheet={characterSheet}
            gameState={gameState}
            onCharacterSelect={handleCharacterSelect}
            onAddChatMessage={handleAddChatMessage}
          />
        )}

        <Chat
          messages={messages}
          onSendMessage={sendMessage}
          selectedAgent={gameState.selectedCharacter}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
