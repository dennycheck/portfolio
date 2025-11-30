/**
 * Modal Component System
 * Handles opening, closing, and managing modal dialogs
 */

(function() {
    'use strict';
    
    // Initialize modals
    function initModals() {
        // Find all modal triggers
        const triggers = document.querySelectorAll('[data-modal-trigger]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal-trigger');
                
                // Handle gallery images
                if (modalId === 'gallery-modal' && this.hasAttribute('data-image-index')) {
                    const imageIndex = this.getAttribute('data-image-index');
                    const galleryItem = this.querySelector('.gallery__image');
                    if (galleryItem) {
                        const modalImageContainer = document.getElementById('gallery-modal-image');
                        if (modalImageContainer) {
                            modalImageContainer.innerHTML = '';
                            
                            // Get the aspect ratio from the item
                            const item = this;
                            const widthNum = parseFloat(item.getAttribute('data-width'));
                            const heightNum = parseFloat(item.getAttribute('data-height'));
                            let aspectRatio = 1;
                            if (widthNum && heightNum && heightNum > 0) {
                                aspectRatio = widthNum / heightNum;
                            }
                            
                            // Create a square wrapper div for the display area
                            const wrapper = document.createElement('div');
                            wrapper.style.width = '100%';
                            wrapper.style.aspectRatio = '1';
                            wrapper.style.display = 'flex';
                            wrapper.style.alignItems = 'center';
                            wrapper.style.justifyContent = 'center';
                            wrapper.style.background = 'transparent';
                            
                            // Clone the image element and preserve its background style
                            const imageElement = galleryItem.cloneNode(true);
                            
                            // Get the original inline style (contains background gradient)
                            const originalStyle = galleryItem.getAttribute('style') || '';
                            
                            // Build the new style string, preserving background and adding sizing
                            let newStyle = originalStyle;
                            
                            // Set aspect ratio and sizing
                            newStyle += `; aspect-ratio: ${aspectRatio}; border-radius: 0; background-size: contain; background-position: center; background-repeat: no-repeat;`;
                            
                            // Determine which dimension should be 100%
                            if (aspectRatio < 1) {
                                // Tall image - height should be 100%
                                newStyle += ` width: auto; height: 100%; max-width: 100%; max-height: 100%;`;
                            } else {
                                // Wide or square image - width should be 100%
                                newStyle += ` width: 100%; height: auto; max-width: 100%; max-height: 100%;`;
                            }
                            
                            imageElement.setAttribute('style', newStyle);
                            
                            wrapper.appendChild(imageElement);
                            modalImageContainer.appendChild(wrapper);
                        }
                        
                        // Update modal content (description only - title is in modal header)
                        // For now, use placeholder data - this can be extended with data attributes
                        const descriptionElement = document.getElementById('gallery-modal-description');
                        if (descriptionElement) {
                            descriptionElement.textContent = 'Image description goes here. This is placeholder text that will be replaced with actual content when images are added.';
                        }
                    }
                }
                
                // Handle Stockholm modal
                if (modalId === 'stockholm-modal') {
                    const galleryItem = this.querySelector('.gallery__image');
                    if (galleryItem) {
                        const modalImageContainer = document.getElementById('stockholm-modal-image');
                        if (modalImageContainer) {
                            modalImageContainer.innerHTML = '';
                            
                            // Get the aspect ratio from the item
                            const item = this;
                            const widthNum = parseFloat(item.getAttribute('data-width'));
                            const heightNum = parseFloat(item.getAttribute('data-height'));
                            let aspectRatio = 1;
                            if (widthNum && heightNum && heightNum > 0) {
                                aspectRatio = widthNum / heightNum;
                            }
                            
                            // Create a square wrapper div for the display area
                            const wrapper = document.createElement('div');
                            wrapper.style.width = '100%';
                            wrapper.style.aspectRatio = '1';
                            wrapper.style.display = 'flex';
                            wrapper.style.alignItems = 'center';
                            wrapper.style.justifyContent = 'center';
                            wrapper.style.background = 'transparent';
                            
                            // Clone the image element
                            const imageElement = galleryItem.cloneNode(true);
                            
                            // Get the original inline style if it exists
                            const originalStyle = galleryItem.getAttribute('style') || '';
                            
                            // Build the new style string, preserving original styles and adding sizing
                            let newStyle = originalStyle;
                            
                            // Set aspect ratio and sizing
                            newStyle += `; aspect-ratio: ${aspectRatio}; border-radius: 0; object-fit: contain;`;
                            
                            // Determine which dimension should be 100%
                            if (aspectRatio < 1) {
                                // Tall image - height should be 100%
                                newStyle += ` width: auto; height: 100%; max-width: 100%; max-height: 100%;`;
                            } else {
                                // Wide or square image - width should be 100%
                                newStyle += ` width: 100%; height: auto; max-width: 100%; max-height: 100%;`;
                            }
                            
                            imageElement.setAttribute('style', newStyle);
                            
                            wrapper.appendChild(imageElement);
                            modalImageContainer.appendChild(wrapper);
                        }
                        
                        // Update modal description
                        const descriptionElement = document.getElementById('stockholm-modal-description');
                        if (descriptionElement) {
                            descriptionElement.textContent = 'A gif created in 2025.';
                        }
                    }
                }
                
                openModal(modalId);
            });
        });
        
        // Find all modal close buttons
        const closeButtons = document.querySelectorAll('[data-modal-close]');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    closeModal(modal.id);
                }
            });
        });
        
        // Close modal when clicking overlay
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this.id);
                }
            });
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal--open');
                if (openModal) {
                    closeModal(openModal.id);
                }
            }
        });
    }
    
    // Open modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('modal--open');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('modal--open');
            document.body.style.overflow = '';
        }
    }
    
    // Expose functions globally
    window.modal = {
        open: openModal,
        close: closeModal
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModals);
    } else {
        initModals();
    }
})();

