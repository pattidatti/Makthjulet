import { Scene } from 'phaser';
import tilesAsset from '../../assets/gfx/roguelikeSheet_transparent.png';

export class DebugScene extends Scene {
    constructor() {
        super('DebugScene');
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
        const spacing = 32;
        const cols = 20; // Number of columns in our debug grid
        const scale = 2; // Make them visible

        // Show tiles 0 to 800 to find crops, roads, castle walls
        for (let i = 0; i < 800; i++) {
            const x = (i % cols) * spacing + 16;
            const y = Math.floor(i / cols) * spacing + 16;

            const sprite = this.add.sprite(x, y, 'roguelike-tiles', i);
            sprite.setScale(scale); // Zoom in

            this.add.text(x - 8, y - 8, i.toString(), {
                fontSize: '8px',
                color: '#ffffff',
                backgroundColor: '#000000'
            }).setOrigin(0);
        }

        // Also log texture info to console to know total frames
        console.log('Total frames:', this.textures.get('roguelike-tiles').frameTotal);
    }
}
