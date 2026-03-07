/**
 * SPA Router for seamless music playback across pages
 * Intercepts navigation and loads content via AJAX
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    contentSelector: '#main',
    excludePatterns: [
      /^https?:\/\/(?!seanleng1\.github\.io)/i, // External links
      /\.(pdf|jpg|jpeg|png|gif|zip|rar)$/i,      // File downloads
      /#$/,                                       // Empty hash links
    ],
    updateTitle: true,
    scrollBehavior: 'smooth'
  };

  // State
  let isNavigating = false;
  let currentUrl = window.location.href;

  /**
   * Check if a link should be handled by the router
   */
  function shouldIntercept(link) {
    if (!link || !link.href) return false;

    // Check if external link
    if (link.hostname !== window.location.hostname) return false;

    // Check exclude patterns
    for (const pattern of config.excludePatterns) {
      if (pattern.test(link.href)) return false;
    }

    // Check if link has target="_blank" or download attribute
    if (link.target === '_blank' || link.hasAttribute('download')) return false;

    // Check if link is in music player (don't intercept player controls)
    if (link.closest('#music-floating') || link.closest('.aplayer')) return false;

    return true;
  }

  /**
   * Extract content from HTML string
   */
  function extractContent(html, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector(selector);

    if (!content) return null;

    // Clone the content to avoid modifying the original
    const clone = content.cloneNode(true);

    // Remove any music player related elements from the extracted content
    // (just in case they somehow ended up inside #main)
    const musicElements = clone.querySelectorAll('#music-floating-container, #music-floating, [id*="aplayer"]');
    musicElements.forEach(el => el.remove());

    // CRITICAL: Remove ALL scripts that might reinitialize the music player
    // This prevents netease.html scripts from running during content replacement
    const scripts = clone.querySelectorAll('script');
    scripts.forEach(script => {
      const scriptText = script.textContent || '';
      if (scriptText.includes('musicPlayerInitialized') ||
          scriptText.includes('aplayer') ||
          scriptText.includes('APlayer') ||
          scriptText.includes('music-floating') ||
          scriptText.includes('meting-js')) {
        script.remove();
      }
    });

    return clone.innerHTML;
  }

  /**
   * Extract title from HTML string
   */
  function extractTitle(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('title');
    return title ? title.textContent : '';
  }

  /**
   * Update page content
   */
  function updateContent(html, url) {
    const newContent = extractContent(html, config.contentSelector);
    if (!newContent) {
      console.error('Could not find content selector:', config.contentSelector);
      return false;
    }

    const container = document.querySelector(config.contentSelector);
    if (!container) {
      console.error('Content container not found');
      return false;
    }

    // IMPORTANT: Store references to music player before any DOM manipulation
    const musicContainer = document.getElementById('music-floating-container');
    const musicFloating = document.getElementById('music-floating');
    const hasActivePlayer = musicContainer && musicFloating;

    // Store player position if it exists
    let savedPlayerPosition = null;
    if (musicFloating) {
      savedPlayerPosition = {
        top: musicFloating.style.top,
        left: musicFloating.style.left,
        right: musicFloating.style.right,
        bottom: musicFloating.style.bottom
      };
    }

    if (hasActivePlayer) {
      console.log('🎵 Protecting music player during navigation');
    }

    // Fade out animation
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
      // CRITICAL: Detach music player from DOM before any updates
      let detachedMusicContainer = null;
      if (hasActivePlayer) {
        detachedMusicContainer = musicContainer.parentNode.removeChild(musicContainer);
      }

      // Update content (this only updates #main, music player is outside)
      container.innerHTML = newContent;

      // Update title
      if (config.updateTitle) {
        const newTitle = extractTitle(html);
        if (newTitle) document.title = newTitle;
      }

      // Update masthead (navigation bar) if present
      // NOTE: Don't update masthead to avoid breaking navigation event handlers
      // The masthead content rarely changes, and updating it can cause issues
      // with event delegation and trigger infinite loops in greedy-nav
      /*
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMasthead = doc.querySelector('.masthead');
      const currentMasthead = document.querySelector('.masthead');
      if (newMasthead && currentMasthead) {
        if (newMasthead.innerHTML !== currentMasthead.innerHTML) {
          currentMasthead.innerHTML = newMasthead.innerHTML;
        }
      }
      */

      // Remove any new music-floating-container that might have been created
      const newMusicContainer = document.getElementById('music-floating-container');
      if (newMusicContainer && hasActivePlayer) {
        newMusicContainer.remove();
      }

      // Re-attach the original music player to the body
      if (detachedMusicContainer) {
        document.body.appendChild(detachedMusicContainer);
      }

      // Re-execute scripts in the new content (but skip music player scripts)
      executeScripts(container);

      // Verify music player is still intact and restore position
      if (hasActivePlayer) {
        const playerStillExists = document.getElementById('music-floating');

        if (!playerStillExists) {
          console.error('❌ Music player was unexpectedly removed!');
        } else {
          // Restore player position if it was saved
          if (savedPlayerPosition && (savedPlayerPosition.top || savedPlayerPosition.left)) {
            if (savedPlayerPosition.top) playerStillExists.style.top = savedPlayerPosition.top;
            if (savedPlayerPosition.left) playerStillExists.style.left = savedPlayerPosition.left;
            if (savedPlayerPosition.right) playerStillExists.style.right = savedPlayerPosition.right;
            if (savedPlayerPosition.bottom) playerStillExists.style.bottom = savedPlayerPosition.bottom;
          }
          console.log('✅ Music player preserved and position restored');
        }
      }

      // Fade in animation
      setTimeout(() => {
        container.style.opacity = '1';

        // Scroll to top or hash target
        if (url.includes('#')) {
          const hash = url.split('#')[1];
          const target = document.getElementById(hash);
          if (target) {
            target.scrollIntoView({ behavior: config.scrollBehavior });
          }
        } else {
          window.scrollTo({ top: 0, behavior: config.scrollBehavior });
        }
      }, 50);
    }, 300);

    return true;
  }

  /**
   * Execute scripts in a container
   */
  function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      // Skip scripts that might interfere with the music player
      const scriptText = oldScript.textContent || '';
      if (scriptText.includes('musicPlayerInitialized') ||
          scriptText.includes('aplayer') ||
          scriptText.includes('APlayer')) {
        console.log('Skipping music player script execution');
        return;
      }

      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  /**
   * Navigate to a URL
   */
  async function navigate(url, pushState = true) {
    if (isNavigating) return;
    if (url === currentUrl) return;

    isNavigating = true;

    try {
      // Show loading indicator (optional)
      document.body.classList.add('spa-loading');

      // Fetch new page
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Update content
      if (updateContent(html, url)) {
        // Update browser history
        if (pushState) {
          window.history.pushState({ url }, '', url);
        }
        currentUrl = url;

        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('spa:navigate', {
          detail: { url, html }
        }));
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to normal navigation
      window.location.href = url;
    } finally {
      isNavigating = false;
      document.body.classList.remove('spa-loading');
    }
  }

  /**
   * Handle click events
   */
  function handleClick(e) {
    const link = e.target.closest('a');

    // Debug: Log every click to see if handler is called
    if (link && link.href) {
      console.log('🖱️ Click detected:', link.href);
    }

    if (!link || !shouldIntercept(link)) {
      return;
    }

    console.log('🔄 SPA Router: INTERCEPTING navigation to', link.href);
    e.preventDefault();
    e.stopPropagation();
    navigate(link.href, true);
  }

  /**
   * Handle popstate (browser back/forward)
   */
  function handlePopState(e) {
    if (e.state && e.state.url) {
      navigate(e.state.url, false);
    } else {
      // Fallback to full page reload
      window.location.reload();
    }
  }

  /**
   * Initialize router
   */
  function init() {
    // Store initial state
    window.history.replaceState({ url: currentUrl }, '', currentUrl);

    // Listen for clicks - use CAPTURE phase to intercept before other handlers
    document.addEventListener('click', handleClick, true);

    // Listen for back/forward
    window.addEventListener('popstate', handlePopState);

    // Add loading styles
    if (!document.getElementById('spa-router-styles')) {
      const style = document.createElement('style');
      style.id = 'spa-router-styles';
      style.textContent = `
        .spa-loading {
          cursor: wait;
        }
        .spa-loading * {
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

    console.log('🚀 SPA Router initialized - music player will be preserved during navigation');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose navigate function globally
  window.spaRouter = { navigate };
})();
