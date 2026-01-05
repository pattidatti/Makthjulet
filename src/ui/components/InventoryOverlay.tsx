import React from 'react';
import { useGameStore } from '../../game/state/store';
import { ItemSlot } from './ItemSlot';

// Assets
import panelBg from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png';
import panelInset from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/panelInset_beige.png';
import iconGold from '../../assets/ui/kenney_ui-pack-rpg-expansion/PNG/iconCircle_beige.png';

interface InventoryOverlayProps {
    onClose: () => void;
}

export const InventoryOverlay: React.FC<InventoryOverlayProps> = ({ onClose }) => {
    const user = useGameStore((state) => state.user);
    if (!user) return null;

    // Defensive checks for older data schemas
    const inventory = user.inventory || [];
    const equipment = user.equipment || {};

    // Create a 5x5 grid array (25 slots)
    const inventorySlots = Array.from({ length: 25 }, (_, i) => {
        return inventory.find(item => item.slot === i);
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto p-4">
            {/* Main Container */}
            <div
                className="relative w-full max-w-4xl p-12 flex flex-col md:flex-row h-[600px]"
                style={{
                    backgroundImage: `url(${panelBg})`,
                    backgroundSize: '100% 100%',
                    imageRendering: 'pixelated'
                }}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-orange-950/40 hover:text-orange-950 transition-colors text-3xl z-20 font-black"
                >
                    ✕
                </button>

                {/* Left Side: Ragdoll & Stats */}
                <div className="flex-1 flex flex-col items-center justify-between relative">
                    <h2 className="text-4xl font-black text-orange-950 uppercase tracking-tighter mb-4 underline decoration-orange-900/20">
                        Karakter
                    </h2>

                    {/* Ragdoll Silhouette */}
                    <div className="relative w-48 h-80 flex justify-center">
                        {/* THE HUMAN SILHOUETTE (SVG) */}
                        <svg viewBox="0 0 100 200" className="absolute inset-0 w-full h-full opacity-10 fill-orange-950">
                            <circle cx="50" cy="30" r="15" /> {/* Head */}
                            <rect x="35" y="50" width="30" height="70" rx="2" /> {/* Torso */}
                            <rect x="20" y="55" width="10" height="60" rx="2" /> {/* Left Arm */}
                            <rect x="70" y="55" width="10" height="60" rx="2" /> {/* Right Arm */}
                            <rect x="35" y="125" width="12" height="70" rx="2" /> {/* Left Leg */}
                            <rect x="53" y="125" width="12" height="70" rx="2" /> {/* Right Leg */}
                        </svg>

                        {/* Equipment Slots Overlay */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-2">
                            <div className="col-start-2 row-start-1">
                                <ItemSlot slotId={-1} isEquipment equipmentType="head" item={equipment.head} />
                            </div>
                            <div className="col-start-2 row-start-2">
                                <ItemSlot slotId={-2} isEquipment equipmentType="chest" item={equipment.chest} />
                            </div>
                            <div className="col-start-2 row-start-3">
                                <ItemSlot slotId={-3} isEquipment equipmentType="legs" item={equipment.legs} />
                            </div>
                            <div className="col-start-1 row-start-2">
                                <ItemSlot slotId={-4} isEquipment equipmentType="mainHand" item={equipment.mainHand} />
                            </div>
                            <div className="col-start-3 row-start-2">
                                <ItemSlot slotId={-5} isEquipment equipmentType="offHand" item={equipment.offHand} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-white/20 p-4 rounded-lg border border-orange-900/10 mt-4 text-center">
                        <div className="text-xs font-black uppercase tracking-widest text-orange-950 opacity-60">
                            Nivå {user.stats.level} ({user.stats.xp} XP)
                        </div>
                    </div>
                </div>

                {/* Right Side: Grid Backpack */}
                <div className="flex-[1.2] flex flex-col ml-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-4xl font-black text-orange-950 uppercase tracking-tighter underline decoration-orange-900/20">
                            Ryggsekk
                        </h2>
                        <span className="text-xs font-bold text-orange-900 bg-white/30 px-3 py-1 rounded border border-orange-900/10">
                            {inventory.length}/25
                        </span>
                    </div>

                    {/* Scrollable Grid Area */}
                    <div
                        className="flex-1 p-6 overflow-y-auto custom-scrollbar"
                        style={{
                            backgroundImage: `url(${panelInset})`,
                            backgroundSize: '100% 100%',
                            imageRendering: 'pixelated'
                        }}
                    >
                        <div className="grid grid-cols-5 gap-1">
                            {inventorySlots.map((item, idx) => (
                                <ItemSlot key={idx} slotId={idx} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Weight / Gold Footer */}
                    <div className="mt-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-orange-100/40 px-4 py-2 rounded-lg border border-orange-900/10">
                            <img src={iconGold} className="w-6 h-6" alt="gold" />
                            <span className="text-2xl font-black text-orange-950 tracking-tight">{Math.floor(user.resources.gold)}</span>
                        </div>
                        <div className="text-[10px] font-black text-orange-950/40 uppercase tracking-[0.2em] italic">
                            Alt bærer sin vekt...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
