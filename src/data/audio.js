/**
 * Audio tracks configuration for Mubassir Shah portfolio.
 * Discovers audio assets in /assets/audio/ and provides playback defaults.
 * 
 * Note: START_AT_SECONDS = 0. Music restarts from 0:00 and loops continuously.
 */

// Discover audio files in assets/audio/ using Vite's glob import
const audioFiles = typeof import.meta.glob === 'function'
  ? import.meta.glob('/assets/audio/*.*', { eager: true, query: '?url' })
  : {};

// Extract URLs from discovered audio modules
const discoveredTracks = Object.values(audioFiles)
  .map(mod => {
    if (typeof mod === 'string') return mod;
    if (mod && typeof mod.default === 'string') return mod.default;
    return null;
  })
  .filter(Boolean);

// Default fallback track URL in case glob returned empty or outside Vite
const fallbackTracks = ['assets/audio/track-1.mp3'];

export const audioConfig = {
  START_AT_SECONDS: 0,
  VOLUME: 0.35,
  FADE_SECONDS: 2,
  FADE_OUT_SECONDS: 0.6,
  STORAGE_KEY: 'mubassir_sound_enabled',
  TOOLTIP_STORAGE_KEY: 'mubassir_sound_tooltip_shown',
  tracks: discoveredTracks.length > 0 ? discoveredTracks : fallbackTracks
};

export { audioFiles };
export default audioConfig;
