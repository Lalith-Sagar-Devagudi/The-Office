import React, { useRef, useEffect, useCallback, useState } from 'react';
import { MapData, GameState } from '../types';
import { OfficeCharacter } from '../classes/OfficeCharacter';
import { OFFICE_ROLES } from '../constants';
import { SpeechBubble } from './SpeechBubble';

interface OfficeCanvasProps {
    mapData: MapData;
    spriteSheet: HTMLImageElement;
    characterSheet: HTMLImageElement;
    gameState: GameState;
    onCharacterSelect: (role: string) => void;
    onAddChatMessage: (sender: string, message: string) => void;
}

export const OfficeCanvas: React.FC<OfficeCanvasProps> = ({
    mapData,
    spriteSheet,
    characterSheet,
    gameState,
    onCharacterSelect,
    onAddChatMessage
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [characters, setCharacters] = useState<OfficeCharacter[]>([]);
    const lastTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const lastProcessedSelection = useRef<string | null>(null);

    // Speech bubble state - now tracks which character has active speech bubble
    const [speechBubble, setSpeechBubble] = useState<{
        visible: boolean;
        message: string;
        x: number;
        y: number;
        characterRole: string | null; // Track which character owns this speech bubble
    }>({
        visible: false,
        message: '',
        x: 0,
        y: 0,
        characterRole: null
    });

    // Function to calculate speech bubble position based on character position
    const calculateSpeechBubblePosition = useCallback((character: OfficeCharacter): { x: number; y: number } => {
        if (!mapData || !canvasRef.current) return { x: 0, y: 0 };

        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        if (!container) return { x: 0, y: 0 };

        // Calculate character position on canvas (in pixels)
        const characterScreenX = character.x * mapData.tileSize * gameState.zoom;
        const characterScreenY = character.y * mapData.tileSize * gameState.zoom;

        // Get canvas position within its container
        const containerRect = container.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        // Calculate offset of canvas within container
        const canvasOffsetX = canvasRect.left - containerRect.left;
        const canvasOffsetY = canvasRect.top - containerRect.top;

        // Calculate speech bubble position
        const bubbleX = characterScreenX + canvasOffsetX;
        const bubbleY = characterScreenY + canvasOffsetY;

        return { x: bubbleX, y: bubbleY };
    }, [mapData, gameState.zoom]);

    const showSpeechBubble = useCallback((character: OfficeCharacter, message: string) => {
        console.log('Showing speech bubble for:', character.role, 'at character position:', character.x, character.y);

        const position = calculateSpeechBubblePosition(character);

        // Update speech bubble state
        setSpeechBubble({
            visible: true,
            message: message,
            x: position.x,
            y: position.y,
            characterRole: character.role
        });

        console.log('Speech bubble state updated successfully');
    }, [calculateSpeechBubblePosition]);

    const hideSpeechBubble = useCallback(() => {
        setSpeechBubble(prev => ({
            ...prev,
            visible: false,
            characterRole: null
        }));
    }, []);

    // Initialize characters
    useEffect(() => {
        const newCharacters: OfficeCharacter[] = [];

        Object.entries(OFFICE_ROLES).forEach(([roleKey, roleData], index) => {
            const character = new OfficeCharacter(roleKey, roleData);
            character.roleData.characterIndex = index;
            newCharacters.push(character);
        });

        setCharacters(newCharacters);

        // Force initial movement after delay
        setTimeout(() => {
            newCharacters.forEach(char => {
                char.nextMoveTime = Date.now() + 500;
            });
        }, 1000);
    }, []);

    // Handle character selection
    useEffect(() => {
        console.log('Character selection changed:', gameState.selectedCharacter);
        console.log('Last processed:', lastProcessedSelection.current);

        if (gameState.selectedCharacter &&
            characters.length > 0 &&
            lastProcessedSelection.current !== gameState.selectedCharacter) {

            const character = characters.find(char => char.role === gameState.selectedCharacter);
            console.log('Found character:', character?.role);

            if (character) {
                // Mark this selection as processed
                lastProcessedSelection.current = gameState.selectedCharacter;

                // Show speech bubble and move to desk
                const message = `Hallo! I'm ${character.roleData.name}`;
                console.log('Processing selection for:', gameState.selectedCharacter);

                showSpeechBubble(character, message);
                onAddChatMessage(character.role, message);
                character.moveToDesk();
            } else {
                console.log('Character not found for role:', gameState.selectedCharacter);
            }
        }

        // Reset processed selection when selection is cleared
        if (!gameState.selectedCharacter) {
            lastProcessedSelection.current = null;
        }
    }, [gameState.selectedCharacter, characters, onAddChatMessage, showSpeechBubble]);

    // Setup canvas
    useEffect(() => {
        if (!mapData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const mapPixelWidth = mapData.mapWidth * mapData.tileSize;
        const mapPixelHeight = mapData.mapHeight * mapData.tileSize;

        canvas.width = Math.min(mapPixelWidth, window.innerWidth - 80);
        canvas.height = Math.min(mapPixelHeight, window.innerHeight - 300);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
        }
    }, [mapData]);

    // Game loop with integrated rendering
    useEffect(() => {
        if (!mapData || !spriteSheet || !characterSheet || characters.length === 0) return;

        const gameLoop = (currentTime: number) => {
            lastTimeRef.current = currentTime;

            // Update characters
            const now = Date.now();
            characters.forEach(character => {
                if (gameState.animationEnabled) {
                    character.update(now, gameState.characterSpeed);
                }
            });

            // Update speech bubble position if there's an active speech bubble
            if (speechBubble.visible && speechBubble.characterRole) {
                const activeCharacter = characters.find(char => char.role === speechBubble.characterRole);
                if (activeCharacter) {
                    const newPosition = calculateSpeechBubblePosition(activeCharacter);
                    setSpeechBubble(prev => ({
                        ...prev,
                        x: newPosition.x,
                        y: newPosition.y
                    }));
                }
            }

            // Render everything
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Render layers (in reverse order)
            const reversedLayers = [...mapData.layers].reverse();
            reversedLayers.forEach(layer => {
                layer.tiles.forEach((tile: any) => {
                    const tileId = parseInt(tile.id);
                    const x = tile.x;
                    const y = tile.y;

                    const spritesPerRow = Math.floor(spriteSheet.width / mapData.tileSize);
                    const srcX = (tileId % spritesPerRow) * mapData.tileSize;
                    const srcY = Math.floor(tileId / spritesPerRow) * mapData.tileSize;

                    const destX = x * mapData.tileSize * gameState.zoom;
                    const destY = y * mapData.tileSize * gameState.zoom;
                    const destSize = mapData.tileSize * gameState.zoom;

                    ctx.drawImage(
                        spriteSheet,
                        srcX, srcY, mapData.tileSize, mapData.tileSize,
                        destX, destY, destSize, destSize
                    );
                });
            });

            // Render boundaries if enabled
            if (gameState.showBoundaries) {
                ctx.save();
                Object.values(OFFICE_ROLES).forEach(role => {
                    const boundary = role.boundary;
                    ctx.strokeStyle = role.color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);

                    const x = boundary.minCol * mapData.tileSize * gameState.zoom;
                    const y = boundary.minRow * mapData.tileSize * gameState.zoom;
                    const width = (boundary.maxCol - boundary.minCol) * mapData.tileSize * gameState.zoom;
                    const height = (boundary.maxRow - boundary.minRow) * mapData.tileSize * gameState.zoom;

                    ctx.strokeRect(x, y, width, height);

                    // Role label
                    ctx.fillStyle = role.color;
                    ctx.font = `${12 * gameState.zoom}px Arial`;
                    ctx.fillText(role.name, x + 5, y + 15 * gameState.zoom);
                });
                ctx.restore();
            }

            // Render characters
            characters.forEach(character => {
                character.render(ctx, characterSheet, mapData, gameState.zoom, gameState.showCharacters, gameState.showBoundaries);

                // Add debug marker to show character position
                if (gameState.showBoundaries) {
                    const charX = character.x * mapData.tileSize * gameState.zoom;
                    const charY = character.y * mapData.tileSize * gameState.zoom;

                    ctx.save();
                    ctx.fillStyle = 'red';
                    ctx.fillRect(charX - 2, charY - 2, 4, 4); // Small red dot at character position
                    ctx.restore();
                }
            });

            // Render grid if enabled
            if (gameState.showGrid) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;

                const tilePixelSize = mapData.tileSize * gameState.zoom;

                for (let x = 0; x <= mapData.mapWidth; x++) {
                    const lineX = x * tilePixelSize;
                    if (lineX <= canvas.width) {
                        ctx.beginPath();
                        ctx.moveTo(lineX, 0);
                        ctx.lineTo(lineX, Math.min(mapData.mapHeight * tilePixelSize, canvas.height));
                        ctx.stroke();
                    }
                }

                for (let y = 0; y <= mapData.mapHeight; y++) {
                    const lineY = y * tilePixelSize;
                    if (lineY <= canvas.height) {
                        ctx.beginPath();
                        ctx.moveTo(0, lineY);
                        ctx.lineTo(Math.min(mapData.mapWidth * tilePixelSize, canvas.width), lineY);
                        ctx.stroke();
                    }
                }

                ctx.restore();
            }

            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        animationFrameRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [mapData, spriteSheet, characterSheet, characters, gameState, speechBubble.visible, speechBubble.characterRole, calculateSpeechBubblePosition]);

    return (
        <div className="canvas-container" style={{ position: 'relative' }}>
            <canvas ref={canvasRef} />
            <SpeechBubble
                message={speechBubble.message}
                x={speechBubble.x}
                y={speechBubble.y}
                visible={speechBubble.visible}
                onClose={hideSpeechBubble}
            />
        </div>
    );
}; 