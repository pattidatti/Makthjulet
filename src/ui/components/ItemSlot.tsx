import React from 'react';
import type { InventoryItem } from '../../game/types/simulation';

// Assets
import slotBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/buttonSquare_beige.png';

interface ItemSlotProps {
    slotId: number;
    item?: InventoryItem;
    isEquipment?: boolean;
    equipmentType?: 'head' | 'chest' | 'legs' | 'mainHand' | 'offHand';
    onInteraction?: (slotId: number) => void;
}

export const ItemSlot: React.FC<ItemSlotProps> = ({ slotId, item, isEquipment, equipmentType, onInteraction }) => {
    return (
        <div
            onClick={() => onInteraction?.(slotId)}
            className={`
                group relative aspect-square transition-all duration-75 cursor-pointer
                flex items-center justify-center p-1
                active:scale-95
            `}
            style={{
                backgroundImage: `url(${slotBg})`,
                backgroundSize: '100% 100%',
                imageRendering: 'pixelated'
            }}
        >
            {/* Slot Content */}
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Equipment Placeholder Icons */}
                {!item && isEquipment && (
                    <div className="text-orange-900/20 text-xl pointer-events-none grayscale opacity-30">
                        {equipmentType === 'head' && '🛡️'}
                        {equipmentType === 'chest' && '👕'}
                        {equipmentType === 'legs' && '👖'}
                        {equipmentType === 'mainHand' && '⚔️'}
                        {equipmentType === 'offHand' && '🛡️'}
                    </div>
                )}

                {/* Item Visual */}
                {item && (
                    <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform filter saturate-150">
                            {item.icon}
                        </span>
                        {item.amount > 1 && (
                            <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-orange-100 bg-orange-900/80 px-1 rounded border border-orange-100/20 shadow-sm leading-tight">
                                {item.amount}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Rarity Glow (Subtle rustic glow) */}
            {item && item.rarity !== 'COMMON' && (
                <div className={`
                    absolute inset-0 pointer-events-none border-2 rounded-lg mix-blend-overlay opacity-30
                    ${item.rarity === 'RARE' ? 'border-blue-500' : ''}
                    ${item.rarity === 'EPIC' ? 'border-purple-500' : ''}
                    ${item.rarity === 'LEGENDARY' ? 'border-amber-500 animate-pulse' : ''}
                `} />
            )}

            {/* Hover Tooltip (Rustic style) */}
            {item && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-orange-50 border-2 border-orange-900/30 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    <div className="text-xs font-black text-orange-950 uppercase border-b border-orange-900/10 mb-1">{item.name}</div>
                    <div className="text-[10px] font-bold text-orange-800/70 tracking-tighter italic capitalize">{item.rarity} {item.type}</div>
                </div>
            )}
        </div>
    );
};
