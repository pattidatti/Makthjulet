import { useEffect, useRef } from 'react';

import StartGame from '../game/main';

export const GameWrapper = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current === null) {
            gameRef.current = StartGame("game-container");
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div id="game-wrapper">
            <div id="game-container" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}
