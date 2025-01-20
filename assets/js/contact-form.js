let isClosing = false;
let isAnimating = false;
const ANIMATION_DURATION = 300;
const modal = document.getElementById('contact-modal');
const modalContent = modal.querySelector('.modal-content');
const warning = document.getElementById('warning-message');
const form = document.getElementById('contact-form');

function resetState() {
  isClosing = false;
  isAnimating = false;
  modal.style.animation = '';
  modalContent.style.animation = '';
  warning.style.transition = '';
  form.style.transition = '';
}

function forceReflow(...elements) {
  elements.forEach(el => void el.offsetHeight);
}

function openContactModal() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Reset everything first
  resetState();
  
  // Set initial display states
  modal.style.display = 'block';
  modalContent.style.display = 'block';
  warning.style.display = 'block';
  form.style.display = 'none';
  document.body.style.overflow = 'hidden';
  
  // Force reflow before animations
  forceReflow(modal, modalContent, warning);
  
  // Set initial opacity states
  warning.style.opacity = '1';
  form.style.opacity = '0';
  
  // Start animations
  requestAnimationFrame(() => {
    modal.style.animation = 'fadeIn 0.3s ease-out forwards';
    modalContent.style.animation = 'scaleIn 0.3s ease-out forwards';
    
    setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_DURATION);
  });
}

function closeContactModal() {
  if (isAnimating || isClosing) return;
  isClosing = true;
  isAnimating = true;
  
  document.body.style.overflow = '';
  
  // Force reflow before animations
  forceReflow(modal, modalContent);
  
  requestAnimationFrame(() => {
    modal.style.animation = 'fadeIn 0.3s ease-out reverse';
    modalContent.style.animation = 'scaleIn 0.3s ease-out reverse';
    
    setTimeout(() => {
      modal.style.display = 'none';
      warning.style.display = 'block';
      warning.style.opacity = '1';
      form.style.display = 'none';
      form.style.opacity = '0';
      
      // Complete reset after everything is done
      resetState();
    }, ANIMATION_DURATION);
  });
}

function showContactForm() {
  if (isAnimating || isClosing) return;
  isAnimating = true;
  
  warning.style.transition = 'opacity 0.3s ease-out';
  form.style.transition = 'opacity 0.3s ease-out';
  
  // Start warning fadeout
  warning.style.opacity = '0';
  
  setTimeout(() => {
    warning.style.display = 'none';
    form.style.display = 'block';
    
    // Force reflow before showing form
    forceReflow(form);
    
    requestAnimationFrame(() => {
      form.style.opacity = '1';
      
      setTimeout(() => {
        isAnimating = false;
      }, ANIMATION_DURATION);
    });
  }, ANIMATION_DURATION);
}

// Close modal when clicking outside
modal.addEventListener('click', function(event) {
  if (event.target === this && !isClosing && !isAnimating) {
    closeContactModal();
  }
});

// Prevent click propagation from modal content
modalContent.addEventListener('click', function(event) {
  event.stopPropagation();
});

// Close modal on ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && modal.style.display === 'block' && !isClosing && !isAnimating) {
    closeContactModal();
  }
});