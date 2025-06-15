import React from 'react';
import { GameState } from '../types';
import { OFFICE_ROLES } from '../constants';

interface ControlsProps {
    gameState: GameState;
    onToggleGrid: () => void;
    onToggleCharacters: () => void;
    onToggleBoundaries: () => void;
    onSelectCharacter: (role: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
    gameState,
    onToggleGrid,
    onToggleCharacters,
    onToggleBoundaries,
    onSelectCharacter
}) => {
    return (
        <div className="controls">
            <div className="control-group">
                <label>👥 Select Agent</label>
                <div className="control-row">
                    {Object.entries(OFFICE_ROLES).map(([roleKey, roleData]) => (
                        <button
                            key={roleKey}
                            onClick={() => {
                                console.log('Character button clicked:', roleKey);
                                onSelectCharacter(roleKey);
                                // Clear selection after 2 seconds to allow re-clicking
                                setTimeout(() => {
                                    onSelectCharacter('');
                                }, 2000);
                            }}
                            className={`character-btn ${gameState.selectedCharacter === roleKey ? 'active' : ''}`}
                        >
                            {getRoleEmoji(roleKey)} {roleData.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="control-group">
                <label>📐 Display Options</label>
                <div className="control-row">
                    <button
                        onClick={onToggleGrid}
                        className={gameState.showGrid ? 'active' : ''}
                    >
                        Grid
                    </button>
                    <button
                        onClick={onToggleCharacters}
                        className={gameState.showCharacters ? 'active' : ''}
                    >
                        {gameState.showCharacters ? 'Characters' : 'No Chars'}
                    </button>
                    <button
                        onClick={onToggleBoundaries}
                        className={gameState.showBoundaries ? 'active' : ''}
                    >
                        {gameState.showBoundaries ? 'Hide Areas' : 'Show Areas'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const getRoleEmoji = (role: string): string => {
    switch (role) {
        case 'CEO': return '🤵';
        case 'DEVELOPER': return '💻';
        case 'HR': return '👔';
        case 'MANAGER': return '📊';
        default: return '👤';
    }
}; 