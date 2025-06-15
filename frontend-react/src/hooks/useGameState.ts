import { useState, useCallback } from 'react';
import { GameState } from '../types';
import { DEFAULT_GAME_STATE } from '../constants';

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);

    const toggleGrid = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            showGrid: !prev.showGrid
        }));
    }, []);

    const toggleCharacters = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            showCharacters: !prev.showCharacters
        }));
    }, []);

    const toggleBoundaries = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            showBoundaries: !prev.showBoundaries
        }));
    }, []);

    const toggleAnimation = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            animationEnabled: !prev.animationEnabled
        }));
    }, []);

    const setCharacterSpeed = useCallback((speed: number) => {
        setGameState(prev => ({
            ...prev,
            characterSpeed: speed
        }));
    }, []);

    const selectCharacter = useCallback((characterRole: string) => {
        console.log('selectCharacter called with:', characterRole);
        setGameState(prev => {
            console.log('Previous game state:', prev);
            const newState = {
                ...prev,
                selectedCharacter: characterRole || null // Convert empty string to null
            };
            console.log('New game state:', newState);
            return newState;
        });
    }, []);

    const updateGameState = useCallback((updates: Partial<GameState>) => {
        setGameState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    return {
        gameState,
        toggleGrid,
        toggleCharacters,
        toggleBoundaries,
        toggleAnimation,
        setCharacterSpeed,
        selectCharacter,
        updateGameState
    };
}; 