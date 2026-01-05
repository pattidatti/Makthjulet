import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { useGameStore } from '../state/store';
import tilesAsset from '../../assets/gfx/roguelikeSheet_transparent.png';

export class MainScene extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private remotePlayers: Map<string, { sprite: Phaser.Physics.Arcade.Sprite, label: Phaser.GameObjects.Text }> = new Map();
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private interactables!: Phaser.Physics.Arcade.StaticGroup;
    private lastPositionBroadcast = 0;
    private broadcastInterval = 66; // ~15 times per second

    private TILE = {
        GRASS: 5,
        TREE_LEAF: 48,
        ROCK_ORE: 568, // Iron Ore
        ROCK_STONE: 566, // Plain Rock
        WHEAT: 391, // Earth for crop
        WHEAT_PLANT: 393, // Planted wheat
        PLAYER: 25
    };

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.spritesheet('roguelike-tiles', tilesAsset, {
            frameWidth: 16,
            frameHeight: 16,
            margin: 0,
            spacing: 1
        });
    }

    create() {
        const mapWidth = 30;
        const mapHeight = 30;
        const tileSize = 16;
        const scale = 3;

        const map = this.make.tilemap({
            tileWidth: tileSize,
            tileHeight: tileSize,
            width: mapWidth,
            height: mapHeight
        });

        const tileset = map.addTilesetImage('roguelike-tiles', 'roguelike-tiles', 16, 16, 0, 1);
        if (!tileset) return;

        const groundLayer = map.createBlankLayer('Ground', tileset);
        if (!groundLayer) return;

        groundLayer.setScale(scale);
        groundLayer.fill(this.TILE.GRASS);

        // 1. Wheat Field (Top Left)
        for (let x = 3; x < 8; x++) {
            for (let y = 3; y < 8; y++) {
                groundLayer.putTileAt(this.TILE.WHEAT, x, y);
            }
        }

        // 2. Physics Groups
        this.interactables = this.physics.add.staticGroup();

        // 3. Place Resources
        const centerX = (mapWidth / 2) * tileSize * scale;
        const centerY = (mapHeight / 2) * tileSize * scale;

        // Forest Area (Group of trees) - Now deeper left
        const treePositions = [
            { x: centerX - 200, y: centerY - 100 },
            { x: centerX - 230, y: centerY - 30 },
            { x: centerX - 180, y: centerY + 50 },
            { x: centerX - 250, y: centerY + 20 }
        ];

        treePositions.forEach((pos, i) => {
            const tree = this.interactables.create(pos.x, pos.y, 'roguelike-tiles', this.TILE.TREE_LEAF);
            tree.setScale(scale);
            tree.setData('type', 'CHOP');
            tree.setData('name', 'Tre #' + (i + 1));
            tree.refreshBody();
        });

        // Mining Area (Iron Ore) - Right side
        const oreRock = this.interactables.create(centerX + 200, centerY - 50, 'roguelike-tiles', this.TILE.ROCK_ORE);
        oreRock.setScale(scale);
        oreRock.setData('type', 'MINE');
        oreRock.setData('name', 'Jernmalm');
        oreRock.refreshBody();

        // Stone Area (Quarry) - Bottom Right
        const stonePositions = [
            { x: centerX + 180, y: centerY + 120 },
            { x: centerX + 230, y: centerY + 150 }
        ];

        stonePositions.forEach((pos) => {
            const stone = this.interactables.create(pos.x, pos.y, 'roguelike-tiles', this.TILE.ROCK_STONE);
            stone.setScale(scale);
            stone.setData('type', 'QUARRY');
            stone.setData('name', 'Gråstein');
            stone.refreshBody();
        });

        // Harvesting Area
        const wheatTrigger = this.interactables.create(centerX - 350, centerY - 350, 'roguelike-tiles', this.TILE.WHEAT_PLANT);
        wheatTrigger.setScale(scale * 2);
        wheatTrigger.setAlpha(0.8);
        wheatTrigger.setData('type', 'HARVEST');
        wheatTrigger.setData('name', 'Kornåker');
        wheatTrigger.refreshBody();

        // 4. Player (Delayed until user data is ready if necessary)
        const user = useGameStore.getState().user;
        if (user) {
            const startX = user.position?.x ?? centerX;
            const startY = user.position?.y ?? centerY;

            this.player = this.physics.add.sprite(startX, startY, 'roguelike-tiles', this.TILE.PLAYER);
            this.player.setScale(scale);
            this.player.setCollideWorldBounds(true);

            // 5. Collisions
            this.physics.add.collider(this.player, this.interactables);

            // 6. Camera
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        } else {
            console.warn("[MainScene] Player created without user data - will retry on first sync");
        }

        this.cameras.main.setBounds(0, 0, mapWidth * tileSize * scale, mapHeight * tileSize * scale);

        // 7. Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        EventBus.emit('current-scene-ready', this);

        // --- Multiplayerr Hooks ---
        EventBus.on('sync-players', (players: any, localId: string) => {
            if (!this.player) {
                // Emergency initialization of local player if they were missed during create()
                const me = players[localId];
                if (me) {
                    this.createLocalPlayer(me);
                }
            }
            this.updateRemotePlayers(players, localId);
        });
    }

    private createLocalPlayer(data: any) {
        const centerX = (30 / 2) * 16 * 3;
        const centerY = (30 / 2) * 16 * 3;
        const startX = data.position?.x ?? centerX;
        const startY = data.position?.y ?? centerY;

        this.player = this.physics.add.sprite(startX, startY, 'roguelike-tiles', this.TILE.PLAYER);
        this.player.setScale(3);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.interactables);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    private updateRemotePlayers(players: Record<string, any>, localId: string) {
        // 1. Remove players who are no longer in the data
        this.remotePlayers.forEach((playerObj, id) => {
            if (!players[id]) {
                playerObj.sprite.destroy();
                playerObj.label.destroy();
                this.remotePlayers.delete(id);
            }
        });

        // 2. Add or Update players
        Object.entries(players).forEach(([id, data]) => {
            if (id === localId) return; // Skip self

            if (!this.remotePlayers.has(id)) {
                // New player!
                const sprite = this.physics.add.sprite(data.position?.x || 0, data.position?.y || 0, 'roguelike-tiles', this.TILE.PLAYER);
                sprite.setScale(3);
                sprite.setTint(0x99ccff); // Give NPCs/Other players a blue-ish tint

                const label = this.add.text(sprite.x, sprite.y - 30, data.name, {
                    fontSize: '12px',
                    fontFamily: 'serif',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5);

                this.remotePlayers.set(id, { sprite, label });
            } else {
                // Update existing player with smoothing
                const playerObj = this.remotePlayers.get(id)!;
                if (data.position) {
                    // We don't snap! We'll use Phasers built-in tween or simple lerp in update
                    // For now, we store the target position in data
                    playerObj.sprite.setData('targetX', data.position.x);
                    playerObj.sprite.setData('targetY', data.position.y);
                }
            }
        });
    }

    update() {
        if (!this.cursors || !this.player) return;

        const speed = 160;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        if (this.player.body) {
            this.player.body.velocity.normalize().scale(speed);
        }

        // --- Interaction Logic (Multi-target) ---
        let nearest: any = null;
        let minDist = 80;

        this.interactables.getChildren().forEach((obj: any) => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = {
                    type: obj.getData('type'),
                    id: obj.getData('id') || 'obj_' + Math.floor(obj.x) + '_' + Math.floor(obj.y),
                    name: obj.getData('name')
                };
            }
        });

        EventBus.emit('near-interactable', nearest);

        // --- Broadcast Position ---
        const now = Date.now();
        if (now - this.lastPositionBroadcast > this.broadcastInterval) {
            if (this.player.body && (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0)) {
                EventBus.emit('local-player-moved', { x: this.player.x, y: this.player.y });
                this.lastPositionBroadcast = now;
            }
        }

        // --- Interpolate Remote Players ---
        this.remotePlayers.forEach((playerObj) => {
            const targetX = playerObj.sprite.getData('targetX');
            const targetY = playerObj.sprite.getData('targetY');

            if (targetX !== undefined && targetY !== undefined) {
                // Simple linear interpolation for smoothness
                playerObj.sprite.x = Phaser.Math.Linear(playerObj.sprite.x, targetX, 0.2);
                playerObj.sprite.y = Phaser.Math.Linear(playerObj.sprite.y, targetY, 0.2);

                // Update label position
                playerObj.label.x = playerObj.sprite.x;
                playerObj.label.y = playerObj.sprite.y - 30;
            }
        });
    }
}
