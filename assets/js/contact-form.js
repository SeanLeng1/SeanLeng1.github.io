let isClosing = false;
const modal = document.getElementById('contact-modal');
const modalContent = modal.querySelector('.modal-content');
const warning = document.getElementById('warning-message');
const form = document.getElementById('contact-form');

function openContactModal() {
  // Reset all states
  isClosing = false;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Force browser reflow
  void modal.offsetWidth;
  void modalContent.offsetWidth;
  
  // Reset to initial state
  warning.style.display = 'block';
  warning.style.opacity = '1';
  form.style.display = 'none';
  form.style.opacity = '0';
  
  // Apply animations
  modal.style.animation = 'fadeIn 0.3s ease-out forwards';
  modalContent.style.animation = 'slideIn 0.3s ease-out forwards';
}

function closeContactModal() {
  if (isClosing) return;
  isClosing = true;
  
  document.body.style.overflow = '';
  modal.style.animation = 'fadeIn 0.3s ease-out reverse';
  modalContent.style.animation = 'slideIn 0.3s ease-out reverse';

  setTimeout(() => {
    modal.style.display = 'none';
    // Clear animation states
    modal.style.animation = '';
    modalContent.style.animation = '';
    isClosing = false;
    
    // Reset form state after animation
    warning.style.display = 'block';
    warning.style.opacity = '1';
    form.style.display = 'none';
    form.style.opacity = '0';
  }, 300);
}

function showContactForm() {
  if (isClosing) return;
  
  warning.style.opacity = '0';
  setTimeout(() => {
    warning.style.display = 'none';
    form.style.display = 'block';
    
    // Force browser reflow
    void form.offsetWidth;
    
    form.style.opacity = '1';
  }, 300);
}

// Close modal when clicking outside
modal.addEventListener('click', function(event) {
  if (event.target === this && !isClosing) {
    closeContactModal();
  });

// Prevent click propagation from modal content
modalContent.addEventListener('click', function(event) {
  event.stopPropagation();
});

// Close modal on ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && modal.style.display === 'block' && !isClosing) {
    closeContactModal();
  }
});