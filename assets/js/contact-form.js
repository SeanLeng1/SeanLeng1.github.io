function openContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    const modalContent = modal.querySelector('.modal-content');
    const warning = document.getElementById('warning-message');
    const form = document.getElementById('contact-form');
    
    modal.style.animation = 'fadeIn 0.3s ease-out reverse';
    modalContent.style.animation = 'slideIn 0.3s ease-out reverse';
    
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Reset everything to initial state
      warning.style.display = 'block';
      warning.style.opacity = '1';
      form.style.display = 'none';
      form.style.opacity = '0';
      
      // Clear animations
      modal.style.animation = '';
      modalContent.style.animation = '';
    }, 300);
  }
  
  function showContactForm() {
    const warning = document.getElementById('warning-message');
    const form = document.getElementById('contact-form');
    
    warning.style.opacity = '0';
    setTimeout(() => {
      warning.style.display = 'none';
      form.style.display = 'block';
      form.style.opacity = '0';
      setTimeout(() => {
        form.style.opacity = '1';
      }, 50);
    }, 300);
  }
  
  // Close modal when clicking outside
  document.getElementById('contact-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeContactModal();
    }
  });
  
  // Close modal on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('contact-modal').style.display === 'block') {
      closeContactModal();
    }
  });