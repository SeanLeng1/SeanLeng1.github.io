/**
 * Music Player Debug Helper
 *
 * In browser console, run:
 *   checkMusicPlayer()
 *
 * This will show you the current state of the music player
 */

window.checkMusicPlayer = function() {
  console.group('🎵 Music Player Status');

  // Check initialization
  console.log('Initialized:', window.musicPlayerInitialized);

  // Check DOM elements
  const container = document.getElementById('music-floating-container');
  const player = document.getElementById('music-floating');
  const aplayerDiv = document.getElementById('aplayer');

  console.log('Container exists:', !!container);
  console.log('Player exists:', !!player);
  console.log('APlayer div exists:', !!aplayerDiv);

  // Check global state
  if (window.musicPlayerState) {
    console.group('Global State');
    console.log('Player initialized:', window.musicPlayerState.playerInitialized);
    console.log('Scripts loaded:', window.musicPlayerState.scriptsLoaded);
    console.log('Current limit:', window.musicPlayerState.currentLimit);
    console.log('APlayer instance:', window.musicPlayerState.aplayerInstance);
    console.groupEnd();
  } else {
    console.warn('Global music player state not found');
  }

  // Check APlayer instance
  if (window.aplayer) {
    console.group('APlayer Instance');
    console.log('Instance:', window.aplayer);

    if (window.aplayer.audio) {
      const audio = window.aplayer.audio;
      console.log('Paused:', audio.paused);
      console.log('Current time:', audio.currentTime.toFixed(2) + 's');
      console.log('Duration:', audio.duration.toFixed(2) + 's');
      console.log('Volume:', audio.volume);
      console.log('Src:', audio.src);
    } else {
      console.warn('Audio element not found');
    }

    if (window.aplayer.list) {
      console.log('List loaded:', window.aplayer.list.audios.length + ' songs');
      console.log('Current index:', window.aplayer.list.index);
    }
    console.groupEnd();
  } else {
    console.warn('APlayer instance not found');
  }

  // Check if player is visible
  if (player) {
    const rect = player.getBoundingClientRect();
    console.log('Player position:', {
      top: rect.top,
      right: window.innerWidth - rect.right,
      width: rect.width,
      height: rect.height
    });
    console.log('Player visible:', rect.width > 0 && rect.height > 0);
  }

  console.groupEnd();
};

// Also provide a shorthand
window.cmp = window.checkMusicPlayer;

console.log('📌 Music Player Debug Helper loaded!');
console.log('Run checkMusicPlayer() or cmp() to check status');
