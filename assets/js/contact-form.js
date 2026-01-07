;(function() {
  // Store references to avoid duplicate listeners
  var boundHandlers = null;

  // Make it globally accessible for SPA router
  window.initContactModal = function initContactModal() {
    console.log('🔧 Initializing contact modal...');

    var modal = document.getElementById('contact-modal');
    var modalContent = modal ? modal.querySelector('.modal-content') : null;
    var warning = document.getElementById('warning-message');
    var form = document.getElementById('contact-form');
    var openBtn = document.querySelector('[data-contact="open"]');
    var closeBtn = document.querySelector('[data-contact="close"]');
    var continueBtn = document.querySelector('[data-contact="continue"]');

    if (!modal || !modalContent || !warning || !form || !openBtn || !closeBtn || !continueBtn) {
      console.warn('Contact modal elements not found');
      return;
    }

    // If already initialized with same elements, skip
    if (boundHandlers && boundHandlers.openBtn === openBtn) {
      console.log('Contact modal already bound to current elements');
      return;
    }

    var animationDuration = 300;
    var isTransitioning = false;

    function openContactModal() {
      if (isTransitioning) return;
      isTransitioning = true;
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';

      void modal.offsetWidth;
      void modalContent.offsetWidth;

      modal.style.animation = 'fadeIn 0.3s ease-out forwards';
      modalContent.style.animation = 'slideIn 0.3s ease-out forwards';

      setTimeout(function() {
        isTransitioning = false;
      }, animationDuration);
    }

    function closeContactModal() {
      if (isTransitioning || modal.style.display !== 'block') return;
      isTransitioning = true;

      modal.style.animation = 'fadeOut 0.3s ease-out forwards';
      modalContent.style.animation = 'slideOut 0.3s ease-out forwards';

      setTimeout(function() {
      modal.style.display = 'none';
        document.body.style.overflow = '';

        warning.style.display = 'block';
        warning.style.opacity = '1';
        form.style.display = 'none';
        form.style.opacity = '0';

        modal.style.animation = '';
        modalContent.style.animation = '';
        isTransitioning = false;
      }, animationDuration);
    }

    function showContactForm() {
      if (isTransitioning) return;
      isTransitioning = true;

      warning.style.opacity = '0';

      setTimeout(function() {
        warning.style.display = 'none';
        form.style.display = 'block';

        void form.offsetWidth;

        form.style.opacity = '1';

        setTimeout(function() {
          isTransitioning = false;
        }, animationDuration);
      }, animationDuration);
    }

    openBtn.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      openContactModal();
    });

    continueBtn.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      showContactForm();
    });

    closeBtn.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      closeContactModal();
    });

    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeContactModal();
      }
    });

    var escapeHandler = function(event) {
      if (event.key === 'Escape') {
        closeContactModal();
      }
    };

    document.addEventListener('keydown', escapeHandler);

    // Store references for future checks
    boundHandlers = {
      openBtn: openBtn,
      escapeHandler: escapeHandler
    };

    console.log('✓ Contact modal initialized');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initContactModal);
  } else {
    window.initContactModal();
  }
})();
