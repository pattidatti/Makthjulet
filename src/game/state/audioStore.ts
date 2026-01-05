import { create } from 'zustand';

const PLAYLIST = [
    '/sounds/music/Ashes of the Keep.mp3',
    '/sounds/music/Banner at the Old Stone Keep (1).mp3',
    '/sounds/music/Banner at the Old Stone Keep.mp3',
    '/sounds/music/Burning Banners Over Stone.mp3',
    '/sounds/music/Candlelit Keep (1).mp3',
    '/sounds/music/Candlelit Keep.mp3',
    '/sounds/music/Crown of Quiet Rooms (1).mp3',
    '/sounds/music/Crown of Quiet Rooms.mp3'
];

interface AudioState {
    isPlaying: boolean;
    isMuted: boolean;
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    currentTrackIndex: number;
    audioElement: HTMLAudioElement | null;

    // Actions
    init: () => void;
    toggleMute: () => void;
    setMasterVolume: (val: number) => void;
    setMusicVolume: (val: number) => void;
    setSfxVolume: (val: number) => void;
    playNext: () => void;
    stop: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    isPlaying: false,
    isMuted: false,
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.7,
    currentTrackIndex: 0,
    audioElement: null,

    init: () => {
        const { audioElement, isMuted, masterVolume, musicVolume, currentTrackIndex } = get();
        if (audioElement) return; // Already init

        const audio = new Audio(PLAYLIST[currentTrackIndex]);
        audio.loop = false;
        audio.volume = isMuted ? 0 : (masterVolume * musicVolume);

        audio.onended = () => {
            get().playNext();
        };

        set({ audioElement: audio });

        // Attempt to play (might fail due to autoplay policy)
        audio.play().then(() => {
            set({ isPlaying: true });
        }).catch(() => {
            console.log("Autoplay blocked. Waiting for user interaction.");
            set({ isPlaying: false });
        });
    },

    toggleMute: () => {
        const { isMuted, audioElement, masterVolume, musicVolume } = get();
        const nextMuted = !isMuted;
        if (audioElement) {
            audioElement.volume = nextMuted ? 0 : (masterVolume * musicVolume);
        }
        set({ isMuted: nextMuted });
    },

    setMasterVolume: (val) => {
        const { audioElement, musicVolume, isMuted } = get();
        const factor = val / 100;
        if (audioElement && !isMuted) {
            audioElement.volume = factor * musicVolume;
        }
        set({ masterVolume: factor });
    },

    setMusicVolume: (val) => {
        const { audioElement, masterVolume, isMuted } = get();
        const factor = val / 100;
        if (audioElement && !isMuted) {
            audioElement.volume = masterVolume * factor;
        }
        set({ musicVolume: factor });
    },

    setSfxVolume: (val) => set({ sfxVolume: val / 100 }),

    playNext: () => {
        const { currentTrackIndex, audioElement, masterVolume, musicVolume, isMuted } = get();
        const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;

        if (audioElement) {
            audioElement.src = PLAYLIST[nextIndex];
            audioElement.volume = isMuted ? 0 : (masterVolume * musicVolume);
            audioElement.play().catch(e => console.error("Play next failed:", e));
        }

        set({ currentTrackIndex: nextIndex, isPlaying: true });
    },

    stop: () => {
        const { audioElement } = get();
        if (audioElement) {
            audioElement.pause();
        }
        set({ isPlaying: false });
    }
}));
