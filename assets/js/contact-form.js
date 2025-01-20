const modal = document.getElementById('contact-modal');
const modalContent = modal.querySelector('.modal-content');
const warning = document.getElementById('warning-message');
const form = document.getElementById('contact-form');
let isTransitioning = false;

function handleContactClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!isTransitioning) {
    openContactModal();
  }
}

function openContactModal() {
  isTransitioning = true;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Force browser reflow
  void modal.offsetWidth;
  void modalContent.offsetWidth;
  
  modal.style.animation = 'fadeIn 0.3s ease-out forwards';
  modalContent.style.animation = 'slideIn 0.3s ease-out forwards';
  
  setTimeout(() => {
    isTransitioning = false;
  }, 300);
}

function handleCloseClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!isTransitioning) {
    closeContactModal();
  }
}

function closeContactModal() {
  if (isTransitioning) return;
  isTransitioning = true;
  
  modal.style.animation = 'fadeOut 0.3s ease-out forwards';
  modalContent.style.animation = 'slideOut 0.3s ease-out forwards';
  
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset state
    warning.style.display = 'block';
    warning.style.opacity = '1';
    form.style.display = 'none';
    form.style.opacity = '0';
    
    // Clear animations
    modal.style.animation = '';
    modalContent.style.animation = '';
    
    isTransitioning = false;
  }, 300);
}

function handleContinueClick(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!isTransitioning) {
    showContactForm();
  }
}

function showContactForm() {
  if (isTransitioning) return;
  isTransitioning = true;
  
  warning.style.opacity = '0';
  
  setTimeout(() => {
    warning.style.display = 'none';
    form.style.display = 'block';
    
    // Force browser reflow
    void form.offsetWidth;
    
    form.style.opacity = '1';
    
    setTimeout(() => {
      isTransitioning = false;
    }, 300);
  }, 300);
}

// Close modal when clicking outside
modal.addEventListener('click', function(event) {
  if (event.target === this && !isTransitioning) {
    closeContactModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && modal.style.display === 'block' && !isTransitioning) {
    closeContactModal();
  }
});