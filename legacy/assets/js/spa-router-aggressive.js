/**
 * Aggressive SPA Router - Intercepts ALL navigation attempts
 * This version hooks into navigation at the lowest level
 */

(function() {
  'use strict';

  console.log('🚀 Aggressive SPA Router loading...');

  // Store original functions
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  let currentUrl = window.location.href;
  let isNavigating = false;

  // Configuration
  const config = {
    contentSelector: '#main',
    preserveMusic: true
  };

  /**
   * Check if URL should use SPA navigation
   */
  function shouldUseSPA(url) {
    try {
      const urlObj = new URL(url, window.location.origin);

      // Only handle same-origin URLs
      if (urlObj.origin !== window.location.origin) return false;

      // Skip hash-only links
      if (urlObj.pathname === window.location.pathname && urlObj.hash) return false;

      // Skip file downloads
      if (/\.(pdf|jpg|jpeg|png|gif|zip|rar)$/i.test(urlObj.pathname)) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Perform SPA navigation
   */
  async function spaNavigate(url) {
    if (isNavigating) return false;
    if (url === currentUrl) return false;

    console.log('🔄 SPA Navigation to:', url);
    isNavigating = true;

    try {
      // Save music player state
      const musicContainer = document.getElementById('music-floating-container');
      const musicFloating = document.getElementById('music-floating');
      const hasActivePlayer = musicContainer && musicFloating;

      let savedPlayerPosition = null;
      let savedAudioState = null;
      let detachedMusicContainer = null;

      if (hasActivePlayer && config.preserveMusic) {
        console.log('🎵 Protecting music player');

        // Save position
        savedPlayerPosition = {
          top: musicFloating.style.top,
          left: musicFloating.style.left,
          right: musicFloating.style.right,
          bottom: musicFloating.style.bottom
        };

        // Save audio state - try multiple methods to find the audio element
        console.log('🔍 Searching for audio element...');
        console.log('   window.aplayer:', !!window.aplayer);
        console.log('   window.musicPlayerState:', !!window.musicPlayerState);

        let aplayer = window.aplayer || (window.musicPlayerState && window.musicPlayerState.aplayerInstance);
        console.log('   aplayer instance:', !!aplayer);

        // CRITICAL: Check if aplayer.audio exists
        console.log('   aplayer.audio exists:', !!(aplayer && aplayer.audio));

        // If APlayer instance exists but audio not ready, save the instance reference
        if (aplayer && !aplayer.audio) {
          console.log('   ⚠️ APlayer instance exists but audio element not yet created (still loading)');
          console.log('   Will save APlayer reference for later restoration');

          // Save just the reference, we'll use APlayer API to resume
          savedAudioState = {
            useAPlayerAPI: true,
            aplayer: aplayer  // Keep reference to the instance
          };
        } else if (aplayer && aplayer.audio) {
          // Audio element exists, save full state
          const audioElement = aplayer.audio;
          savedAudioState = {
            useAPlayerAPI: false,
            paused: audioElement.paused,
            currentTime: audioElement.currentTime,
            volume: audioElement.volume,
            src: audioElement.src,
            playbackRate: audioElement.playbackRate
          };
          console.log('💾 Saved audio state:', {
            paused: savedAudioState.paused,
            time: savedAudioState.currentTime.toFixed(2),
            volume: savedAudioState.volume,
            src: savedAudioState.src ? 'yes' : 'no'
          });
        } else {
          console.warn('⚠️ Neither APlayer instance nor audio element found');
        }

        // Instead of detaching, just mark it to prevent removal
        // This keeps all event listeners and state intact
        musicContainer.setAttribute('data-spa-preserve', 'true');
        detachedMusicContainer = musicContainer;  // Keep reference but don't actually detach
      }

      // Fetch new page
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract main content
      const newMain = doc.querySelector(config.contentSelector);
      if (!newMain) throw new Error('Content selector not found');

      // Remove music player scripts from new content
      const scripts = newMain.querySelectorAll('script');
      scripts.forEach(script => {
        const text = script.textContent || '';
        if (text.includes('musicPlayerInitialized') ||
            text.includes('aplayer') ||
            text.includes('meting-js')) {
          script.remove();
        }
      });

      // Update DOM
      const container = document.querySelector(config.contentSelector);
      if (container) {
        container.innerHTML = newMain.innerHTML;
      }

      // Update title
      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;

      // The music player was never detached, it's still in the DOM
      // Just remove the preserve marker and check for duplicates
      if (detachedMusicContainer) {
        detachedMusicContainer.removeAttribute('data-spa-preserve');
      }

      // Remove any duplicate music-floating-container that might have been created
      const allMusicContainers = document.querySelectorAll('#music-floating-container');
      if (allMusicContainers.length > 1 && hasActivePlayer) {
        console.log(`   Found ${allMusicContainers.length} music containers, removing duplicates`);
        allMusicContainers.forEach((container, index) => {
          if (index > 0 || container !== detachedMusicContainer) {
            container.remove();
          }
        });
      }

      // Music player should still be attached, no need to reattach
      if (detachedMusicContainer && document.body.contains(detachedMusicContainer)) {
        console.log('   Music player still in DOM, continuing...');

        // Restore position
        const player = document.getElementById('music-floating');
        if (player && savedPlayerPosition) {
          if (savedPlayerPosition.top) player.style.top = savedPlayerPosition.top;
          if (savedPlayerPosition.left) player.style.left = savedPlayerPosition.left;
          if (savedPlayerPosition.right) player.style.right = savedPlayerPosition.right;
          if (savedPlayerPosition.bottom) player.style.bottom = savedPlayerPosition.bottom;
        }

        // Restore audio state - even if we didn't save state, the player should continue
        // The DOM was preserved, so APlayer should still be functional
        if (savedAudioState && !savedAudioState.useAPlayerAPI) {
          // We have actual audio state to restore
          setTimeout(() => {
            console.log('♻️ Restoring audio state...');

            const audioElement = musicContainer.querySelector('audio') ||
                                document.querySelector('.aplayer audio') ||
                                document.querySelector('#aplayer audio');

            if (audioElement) {
              console.log('   Found audio element, restoring...');

              try {
                audioElement.volume = savedAudioState.volume;

                if (savedAudioState.currentTime > 0) {
                  audioElement.currentTime = savedAudioState.currentTime;
                }

                audioElement.playbackRate = savedAudioState.playbackRate;

                if (!savedAudioState.paused) {
                  audioElement.play().then(() => {
                    console.log('▶️ Playback resumed at', savedAudioState.currentTime.toFixed(2), 's');
                  }).catch(err => {
                    console.warn('⚠️ Failed to auto-resume:', err.message);
                  });
                } else {
                  console.log('   Audio was paused, not resuming');
                }

                console.log('✅ Audio state restored');
              } catch (err) {
                console.error('❌ Error restoring audio state:', err);
              }
            } else {
              console.warn('⚠️ Audio element not found after reattachment');
            }
          }, 100);
        } else {
          // No saved state or APlayer was still loading
          console.log('ℹ️ No audio state to restore (player may still be initializing)');
          console.log('   Player DOM was preserved, it should continue loading/playing');
        }

        console.log('✅ Music player preserved');
      }

      // Update history
      originalPushState.call(history, { url }, '', url);
      currentUrl = url;

      console.log('🔧 About to execute scripts...');

      try {
        // Execute new scripts (except music player)
        executeScripts(container);

        console.log('🔧 Scripts executed, checking container:', container);

        // Re-initialize all event handlers after SPA navigation
        console.log('🔧 Re-initializing event handlers...');
        setTimeout(function() {
          // 1. Re-initialize homepage elements (glass buttons + WeChat trigger)
          if (typeof window.initHomePageElements === 'function') {
            console.log('   ✓ Re-initializing homepage elements');
            window.initHomePageElements();
          }

          // 2. Contact form modal should work (uses event delegation)
          // But let's trigger a re-init if the function exists
          if (typeof window.initContactModal === 'function') {
            console.log('   ✓ Re-initializing contact modal');
            window.initContactModal();
          }

          // 3. Dispatch custom event for any other scripts that need to re-initialize
          window.dispatchEvent(new CustomEvent('spa:navigate', {
            detail: { url: url, timestamp: Date.now() }
          }));
          console.log('   ✓ Dispatched spa:navigate event');

        }, 300);
      } catch (err) {
        console.error('❌ Error during script execution or initialization:', err);
      }

      return true;
    } catch (error) {
      console.error('SPA navigation failed:', error);
      return false;
    } finally {
      isNavigating = false;
    }
  }

  /**
   * Execute scripts in container
   */
  function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const text = oldScript.textContent || '';

      // Skip music player scripts
      if (text.includes('musicPlayerInitialized') || text.includes('aplayer')) {
        return;
      }

      // Skip scripts that declare global variables (to avoid "already declared" errors)
      // These are usually modal/form handlers that should only run once
      if (text.includes('const deadlinesModal') ||
          text.includes('const modal') ||
          text.includes('let deadlinesModal') ||
          text.includes('let modal')) {
        console.log('⏭️ Skipping script with global declarations to avoid conflicts');
        return;
      }

      const newScript = document.createElement('script');
      newScript.textContent = oldScript.textContent;
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  /**
   * Intercept all link clicks at the EARLIEST possible moment
   */
  function interceptClicks(e) {
    // Check for modal triggers FIRST, before finding link element
    // This way we catch clicks on buttons or non-link elements
    const clickedElement = e.target;

    // Check if clicked element or any parent is a modal trigger
    let checkElement = clickedElement;
    while (checkElement && checkElement !== document.body) {
      if (checkElement.hasAttribute && (
          checkElement.hasAttribute('data-wechat-trigger') ||
          checkElement.hasAttribute('data-contact') ||
          checkElement.classList.contains('preview-button') ||
          checkElement.classList.contains('contact-button'))) {
        console.log('🖱️ Skipping modal trigger (early detection):', checkElement);
        return; // Let the modal handler deal with it
      }
      checkElement = checkElement.parentElement;
    }

    // Get the actual link element
    let target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }

    if (!target || !target.href) return;

    // Skip music player links
    if (target.closest('#music-floating') || target.closest('.aplayer')) {
      return;
    }

    // Skip javascript: and # links that might be modal triggers
    if (target.href.startsWith('javascript:') || target.href.endsWith('#')) {
      console.log('🖱️ Skipping javascript/hash link:', target.href);
      return;
    }

    // Log every click for debugging
    console.log('🖱️ Link click:', target.href);

    // Check if we should intercept
    if (!shouldUseSPA(target.href)) {
      console.log('   → Allowing default navigation');
      return;
    }

    console.log('   → Intercepting!');

    // Prevent default IMMEDIATELY
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Navigate
    spaNavigate(target.href).then(success => {
      if (!success) {
        // Fallback to normal navigation
        window.location.href = target.href;
      }
    });
  }

  // Hook into clicks at the CAPTURE phase with highest priority
  document.addEventListener('click', interceptClicks, true);

  // Also hook into touchstart for mobile
  document.addEventListener('touchstart', function(e) {
    let target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    if (target && target.href) {
      target.setAttribute('data-spa-touch', 'true');
    }
  }, true);

  // Override history methods
  history.pushState = function(state, title, url) {
    if (url && shouldUseSPA(url)) {
      spaNavigate(url);
    } else {
      return originalPushState.apply(this, arguments);
    }
  };

  history.replaceState = function(state, title, url) {
    if (url && shouldUseSPA(url)) {
      currentUrl = url;
    }
    return originalReplaceState.apply(this, arguments);
  };

  // Handle back/forward
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.url) {
      spaNavigate(e.state.url);
    }
  });

  // Initialize
  originalReplaceState.call(history, { url: currentUrl }, '', currentUrl);

  console.log('✅ Aggressive SPA Router initialized');
  console.log('   Music player will be preserved during navigation');
})();
