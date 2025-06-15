import { RoleData, MapData } from '../types';
import { CHARACTER_CONFIG, OFFICE_ROLES } from '../constants';

export class OfficeCharacter {
    role: string;
    roleData: RoleData;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    direction: 'down' | 'up' | 'left' | 'right';
    animFrame: number;
    lastAnimTime: number;
    moving: boolean;
    speed: number;
    startX: number;
    startY: number;
    moveStartTime: number;
    moveDuration: number;
    isMoving: boolean;
    nextMoveTime: number;
    personality: number;
    roamRadius: number;
    atDesk: boolean;
    deskStartTime: number;
    tinkering: boolean;
    tinkerStartTime: number;

    constructor(role: string, roleData: RoleData) {
        this.role = role;
        this.roleData = roleData;

        // Spawn in center of designated area
        const centerRow = (roleData.boundary.minRow + roleData.boundary.maxRow) / 2;
        const centerCol = (roleData.boundary.minCol + roleData.boundary.maxCol) / 2;

        this.x = centerCol;
        this.y = centerRow;
        this.targetX = centerCol;
        this.targetY = centerRow;

        this.direction = 'down';
        this.animFrame = 0;
        this.lastAnimTime = Date.now();
        this.moving = false;
        this.speed = 60; // pixels per second

        // Smooth movement properties
        this.startX = centerCol;
        this.startY = centerRow;
        this.moveStartTime = 0;
        this.moveDuration = 0;
        this.isMoving = false;

        // AI behavior
        this.nextMoveTime = Date.now() + Math.random() * 2000 + 1000;
        this.personality = this.getRolePersonality();
        this.roamRadius = this.getRoamRadius();

        // Desk behavior
        this.atDesk = false;
        this.deskStartTime = 0;
        this.tinkering = false;
        this.tinkerStartTime = 0;
    }

    getRolePersonality(): number {
        switch (this.role) {
            case 'CEO': return 0.3; // Moves less, stays in corner
            case 'DEVELOPER': return 0.8; // Active, moves around a lot
            case 'HR': return 0.6; // Moderate movement
            case 'MANAGER': return 0.7; // Fairly active
            default: return 0.5;
        }
    }

    getRoamRadius(): number {
        switch (this.role) {
            case 'CEO': return 2; // Small movement area
            case 'DEVELOPER': return 3; // Medium area
            case 'HR': return 2.5; // Medium area
            case 'MANAGER': return 3; // Medium area
            default: return 2;
        }
    }

    update(currentTime: number, characterSpeed: number): void {
        // Handle animation with different speeds for different activities
        let animationSpeed = CHARACTER_CONFIG.animationSpeed;

        // Slower animation when at desk (working motions)
        if (this.atDesk && this.tinkering) {
            animationSpeed = CHARACTER_CONFIG.animationSpeed * 2; // Half speed for desk work
        }

        if (currentTime - this.lastAnimTime > animationSpeed) {
            if (this.isMoving) {
                // Full walking animation when moving
                this.animFrame = (this.animFrame + 1) % CHARACTER_CONFIG.walkFrames;
            } else if (this.tinkering) {
                // Slower work animation when at desk (simulates typing, working motions)
                this.animFrame = (this.animFrame + 1) % CHARACTER_CONFIG.walkFrames;
            } else {
                this.animFrame = 0; // Idle frame
            }
            this.lastAnimTime = currentTime;
        }

        // Handle desk behavior
        this.updateDeskBehavior();

        // Only do normal movement if not at desk
        if (!this.atDesk) {
            // Handle smooth movement
            if (this.isMoving) {
                const elapsed = currentTime - this.moveStartTime;
                const progress = Math.min(elapsed / this.moveDuration, 1);

                // Smooth interpolation (easing)
                const easeProgress = this.easeInOutQuad(progress);

                this.x = this.startX + (this.targetX - this.startX) * easeProgress;
                this.y = this.startY + (this.targetY - this.startY) * easeProgress;

                if (progress >= 1) {
                    // Movement complete
                    this.x = this.targetX;
                    this.y = this.targetY;
                    this.isMoving = false;
                    this.nextMoveTime = currentTime + Math.random() * 2000 + 1000;
                }
            } else {
                // Check if it's time to move
                if (currentTime > this.nextMoveTime) {
                    this.startNewMovement(currentTime, characterSpeed);
                }
            }
        }
    }

    easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    startNewMovement(currentTime: number, characterSpeed: number): void {
        const boundary = this.roleData.boundary;

        // Simple random movement within boundaries
        const newX = Math.floor(Math.random() * (boundary.maxCol - boundary.minCol + 1)) + boundary.minCol;
        const newY = Math.floor(Math.random() * (boundary.maxRow - boundary.minRow + 1)) + boundary.minRow;

        // Start smooth movement
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = newX;
        this.targetY = newY;

        // Calculate movement duration based on distance
        const distance = Math.sqrt(
            Math.pow(this.targetX - this.startX, 2) +
            Math.pow(this.targetY - this.startY, 2)
        );
        this.moveDuration = Math.max(1000, (distance / characterSpeed) * 1000);

        // Set direction based on movement
        const dx = this.targetX - this.startX;
        const dy = this.targetY - this.startY;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }

        this.moveStartTime = currentTime;
        this.isMoving = true;
    }

    updateDeskBehavior(): void {
        if (!this.atDesk) return;

        if (this.tinkering) {
            const desk = this.roleData.desk;
            const deskCenterCol = Math.floor((desk.minCol + desk.maxCol) / 2);
            const deskCenterRow = Math.floor((desk.minRow + desk.maxRow) / 2);
            const currentTime = Date.now();

            // Add idle movements to make character look active at desk
            this.addDeskIdleMovements(currentTime, desk, deskCenterCol, deskCenterRow);
        }
    }

    addDeskIdleMovements(currentTime: number, desk: any, centerCol: number, centerRow: number): void {
        const timeSinceDesk = currentTime - this.deskStartTime;

        // Change direction every 2-4 seconds to simulate looking around
        const directionChangeInterval = 2000 + (this.personality * 2000); // 2-4 seconds based on personality
        const directionPhase = Math.floor(timeSinceDesk / directionChangeInterval) % 4;

        // Cycle through directions: down -> right -> up -> left
        const directions: ('down' | 'right' | 'up' | 'left')[] = ['down', 'right', 'up', 'left'];
        this.direction = directions[directionPhase];

        // Add subtle position shifts within desk area (simulating shifting in chair, leaning, etc.)
        const shiftAmount = 0.2; // Small movement range
        const timeOffset = this.personality * 1000; // Each character has slightly different timing

        // Create gentle swaying motion
        const swayX = Math.sin((timeSinceDesk + timeOffset) / 1500) * shiftAmount;
        const swayY = Math.cos((timeSinceDesk + timeOffset) / 2000) * shiftAmount * 0.5;

        // Apply subtle movements within desk bounds
        this.x = centerCol + swayX;
        this.y = centerRow + swayY;

        // Ensure character stays within desk area
        this.x = Math.max(desk.minCol + 0.2, Math.min(desk.maxCol - 0.2, this.x));
        this.y = Math.max(desk.minRow + 0.2, Math.min(desk.maxRow - 0.2, this.y));

        // Add occasional "busy work" animations - brief direction changes
        const busyWorkInterval = 5000 + (Math.random() * 5000); // Every 5-10 seconds
        if (timeSinceDesk % busyWorkInterval < 500) { // Brief 500ms action
            // Quick look to the side or up (simulating checking something)
            const quickActions: ('left' | 'right' | 'up')[] = ['left', 'right', 'up'];
            this.direction = quickActions[Math.floor(Math.random() * quickActions.length)];
        }

        // Add role-specific idle behaviors
        this.addRoleSpecificIdleBehavior(timeSinceDesk, centerCol, centerRow);
    }

    addRoleSpecificIdleBehavior(timeSinceDesk: number, centerCol: number, centerRow: number): void {
        const behaviorCycle = timeSinceDesk / 1000; // Convert to seconds

        switch (this.role) {
            case 'CEO':
                // CEO looks around more (checking on employees), occasional authoritative poses
                if (behaviorCycle % 8 < 1) { // Every 8 seconds, look around for 1 second
                    this.direction = behaviorCycle % 16 < 8 ? 'left' : 'right';
                }
                break;

            case 'DEVELOPER':
                // Developer types more actively, occasionally looks up (thinking)
                if (behaviorCycle % 6 < 0.5) { // Quick look up every 6 seconds
                    this.direction = 'up';
                } else if (behaviorCycle % 3 < 2) { // Face down most of the time (coding)
                    this.direction = 'down';
                }
                break;

            case 'HR':
                // HR person looks around more (people-focused), friendly demeanor
                if (behaviorCycle % 5 < 1) { // Look around every 5 seconds
                    this.direction = Math.random() < 0.5 ? 'left' : 'right';
                }
                break;

            case 'MANAGER':
                // Manager alternates between looking at work and looking around (supervising)
                if (behaviorCycle % 7 < 2) { // Look around for 2 seconds every 7 seconds
                    this.direction = behaviorCycle % 14 < 7 ? 'left' : 'right';
                } else {
                    this.direction = 'down'; // Focus on work
                }
                break;
        }
    }

    moveToDesk(): void {
        const desk = this.roleData.desk;
        const deskCenterCol = Math.floor((desk.minCol + desk.maxCol) / 2);
        const deskCenterRow = Math.floor((desk.minRow + desk.maxRow) / 2);

        // Stop current movement and switch to desk mode
        this.isMoving = false;
        this.atDesk = true;
        this.deskStartTime = Date.now();

        // Start smooth movement to desk
        const startX = this.x;
        const startY = this.y;
        const startTime = Date.now();
        const moveDuration = 1500;

        const animateToDesk = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / moveDuration, 1);

            const easedProgress = this.easeInOutQuad(progress);

            this.x = startX + (deskCenterCol - startX) * easedProgress;
            this.y = startY + (deskCenterRow - startY) * easedProgress;

            if (Math.abs(deskCenterCol - startX) > Math.abs(deskCenterRow - startY)) {
                this.direction = deskCenterCol > startX ? 'right' : 'left';
            } else {
                this.direction = deskCenterRow > startY ? 'down' : 'up';
            }

            if (progress < 1) {
                requestAnimationFrame(animateToDesk);
            } else {
                this.tinkering = true;
                this.tinkerStartTime = Date.now();
            }
        };

        animateToDesk();
    }

    render(ctx: CanvasRenderingContext2D, characterSheet: HTMLImageElement, mapData: MapData, zoom: number, showCharacters: boolean, showBoundaries: boolean): void {
        if (!characterSheet || !characterSheet.complete || !showCharacters) return;

        const screenX = this.x * mapData.tileSize * zoom;
        const screenY = this.y * mapData.tileSize * zoom;
        const renderSize = CHARACTER_CONFIG.frameWidth * zoom;

        // Calculate source position in character sheet
        const directionRow = this.direction === 'down' || this.direction === 'up' ? 0 : 1;
        const srcX = this.roleData.characterIndex * CHARACTER_CONFIG.frameWidth;
        const srcY = (this.roleData.rowStart + directionRow) * CHARACTER_CONFIG.frameHeight;

        // Draw character
        ctx.drawImage(
            characterSheet,
            srcX, srcY,
            CHARACTER_CONFIG.frameWidth, CHARACTER_CONFIG.frameHeight,
            screenX, screenY,
            renderSize, renderSize
        );

        // Draw role indicator
        if (showBoundaries) {
            ctx.save();
            ctx.fillStyle = this.roleData.color;
            ctx.font = `${10 * zoom}px Arial`;
            ctx.fillText(this.roleData.name, screenX, screenY - 5);
            ctx.restore();
        }
    }
} 