export interface MapData {
    mapWidth: number;
    mapHeight: number;
    tileSize: number;
    layers: Layer[];
}

export interface Layer {
    name: string;
    tiles: Tile[];
}

export interface Tile {
    id: string;
    x: number;
    y: number;
}

export interface Boundary {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
}

export interface RoleData {
    name: string;
    title: string;
    rowStart: number;
    characterIndex: number;
    boundary: Boundary;
    desk: Boundary;
    color: string;
    description: string;
}

export interface CharacterConfig {
    frameWidth: number;
    frameHeight: number;
    animationSpeed: number;
    walkFrames: number;
    idleFrames: number;
    directions: {
        down: number;
        up: number;
        left: number;
        right: number;
    };
}

export interface ChatMessage {
    type: 'system' | 'user' | 'agent';
    message: string;
    sender?: string;
    timestamp: string;
}

export interface GameState {
    showGrid: boolean;
    showCharacters: boolean;
    showBoundaries: boolean;
    animationEnabled: boolean;
    zoom: number;
    characterSpeed: number;
    selectedCharacter: string | null;
} 