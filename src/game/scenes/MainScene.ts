import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainScene extends Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // Hello World styling
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);

        // Listen for events from React
        EventBus.on('test-connection', this.onTestConnection, this);

        // Clean up listener when scene shuts down
        this.events.on('shutdown', () => {
            EventBus.off('test-connection', this.onTestConnection, this);
        });
    }

    onTestConnection() {
        console.log('Melding mottatt fra React!');
    }

    changeScene() {
        // Placeholder for future scene switching
    }
}
