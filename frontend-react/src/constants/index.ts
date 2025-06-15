import { RoleData, CharacterConfig } from '../types';

export const CHARACTER_CONFIG: CharacterConfig = {
    frameWidth: 32,
    frameHeight: 32,
    animationSpeed: 300,
    walkFrames: 4,
    idleFrames: 1,
    directions: {
        down: 0,
        up: 1,
        left: 2,
        right: 3
    }
};

export const OFFICE_ROLES: Record<string, RoleData> = {
    CEO: {
        name: "CEO",
        title: "Chief Executive Officer",
        rowStart: 0,
        characterIndex: 0,
        boundary: { minRow: 20, maxRow: 25, minCol: 1, maxCol: 8 },
        desk: { minRow: 23, maxRow: 25, minCol: 1, maxCol: 3 },
        color: "#FFD700",
        description: "Corner office"
    },
    DEVELOPER: {
        name: "Developer",
        title: "Software Developer",
        rowStart: 2,
        characterIndex: 1,
        boundary: { minRow: 7, maxRow: 11, minCol: 27, maxCol: 33 },
        desk: { minRow: 8, maxRow: 10, minCol: 27, maxCol: 30 },
        color: "#00FF00",
        description: "Development area"
    },
    HR: {
        name: "HR",
        title: "Human Resources",
        rowStart: 4,
        characterIndex: 2,
        boundary: { minRow: 14, maxRow: 18, minCol: 1, maxCol: 8 },
        desk: { minRow: 16, maxRow: 18, minCol: 1, maxCol: 3 },
        color: "#FF69B4",
        description: "HR department"
    },
    MANAGER: {
        name: "Manager",
        title: "Project Manager",
        rowStart: 6,
        characterIndex: 3,
        boundary: { minRow: 11, maxRow: 15, minCol: 37, maxCol: 41 },
        desk: { minRow: 12, maxRow: 14, minCol: 38, maxCol: 40 },
        color: "#FF8C00",
        description: "Management zone"
    }
};

export const CHAT_RESPONSES = [
    "Acknowledged. Processing your request.",
    "Roger that. I'm on it.",
    "Understood. Let me handle this.",
    "Copy that. Working on it now.",
    "Message received. Taking action.",
    "Got it. I'll get right on that.",
    "Affirmative. Standing by for further instructions.",
    "Message logged. Task initiated.",
    "Received and understood. Proceeding.",
    "Command acknowledged. Executing now."
];

export const DEFAULT_GAME_STATE = {
    showGrid: false,
    showCharacters: true,
    showBoundaries: false,
    animationEnabled: true,
    zoom: 1,
    characterSpeed: 2,
    selectedCharacter: null
}; 