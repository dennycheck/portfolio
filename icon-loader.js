/**
 * Icon Loader System
 * Loads Heroicons SVG files and creates icon components
 */

(function() {
    'use strict';
    
    const ICON_BASE_PATH = 'icons/heroicons-master/optimized';
    
    /**
     * Load an icon SVG and return its content
     * @param {string} iconName - Name of the icon (e.g., 'arrow-right')
     * @param {number} size - Icon size: 16, 20, or 24 (default: 24)
     * @param {string} style - 'solid' or 'outline' (default: 'solid')
     * @returns {Promise<string>} SVG content
     */
    async function loadIcon(iconName, size = 24, style = 'solid') {
        const iconPath = `${ICON_BASE_PATH}/${size}/${style}/${iconName}.svg`;
        console.log(`Attempting to load icon from: ${iconPath}`);
        
        try {
            const response = await fetch(iconPath);
            console.log(`Response status for ${iconName}:`, response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Icon not found: ${iconName} (${response.status})`);
            }
            const text = await response.text();
            console.log(`Successfully loaded ${iconName}, content length:`, text.length);
            return text;
        } catch (error) {
            console.error(`Error loading icon ${iconName} from ${iconPath}:`, error);
            return null;
        }
    }
    
    /**
     * Create an icon element
     * @param {string} iconName - Name of the icon
     * @param {number} size - Icon size: 16, 20, or 24
     * @param {string} style - 'solid' or 'outline'
     * @returns {Promise<HTMLElement>} Icon element
     */
    async function createIcon(iconName, size = 24, style = 'solid') {
        const svgContent = await loadIcon(iconName, size, style);
        if (!svgContent) {
            return null;
        }
        
        const wrapper = document.createElement('span');
        wrapper.className = 'icon';
        wrapper.style.display = 'inline-block';
        wrapper.style.lineHeight = '0';
        wrapper.style.margin = '0';
        wrapper.style.padding = '0';
        wrapper.style.verticalAlign = 'middle';
        wrapper.innerHTML = svgContent;
        
        // Ensure the SVG uses currentColor for theming
        const svg = wrapper.querySelector('svg');
        if (svg) {
            svg.setAttribute('fill', 'currentColor');
            svg.setAttribute('width', `${size}`);
            svg.setAttribute('height', `${size}`);
            svg.style.width = `${size}px`;
            svg.style.height = `${size}px`;
            svg.style.display = 'block';
            svg.style.margin = '0';
            svg.style.padding = '0';
        } else {
            console.error('No SVG element found in loaded icon content');
        }
        
        return wrapper;
    }
    
    /**
     * Initialize icon elements with data-icon attributes
     */
    async function initIcons() {
        const iconElements = document.querySelectorAll('[data-icon]');
        
        if (iconElements.length === 0) {
            console.warn('No elements with [data-icon] attribute found');
            return;
        }
        
        console.log(`Found ${iconElements.length} icon elements to load`);
        
        // Use for...of to properly handle async operations
        for (const element of iconElements) {
            const iconName = element.getAttribute('data-icon');
            const size = parseInt(element.getAttribute('data-icon-size') || '24');
            const style = element.getAttribute('data-icon-style') || 'solid';
            
            if (!iconName) {
                console.warn('Element has data-icon attribute but no value:', element);
                continue;
            }
            
            const icon = await createIcon(iconName, size, style);
            if (icon) {
                console.log(`Created icon element for ${iconName}, innerHTML length:`, icon.innerHTML.length);
                // Replace element content or append
                if (element.hasAttribute('data-icon-replace')) {
                    element.innerHTML = icon.innerHTML;
                    console.log(`Replaced content of element with icon ${iconName}`);
                } else {
                    element.appendChild(icon);
                    console.log(`Appended icon ${iconName} to element`);
                }
                // Force visibility
                element.style.display = 'inline-block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
            } else {
                console.error(`Failed to load icon: ${iconName} (size: ${size}, style: ${style})`);
            }
        }
        
        // Dispatch event when icons are loaded
        window.dispatchEvent(new CustomEvent('iconsLoaded'));
    }
    
    // Expose functions globally
    window.iconLoader = {
        load: loadIcon,
        create: createIcon,
        init: initIcons
    };
    
    // Initialize when DOM is ready
    function startInit() {
        console.log('Icon loader: Starting initialization');
        initIcons().catch(function(error) {
            console.error('Icon loader: Error during initialization', error);
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInit);
    } else {
        // DOM already loaded, run immediately but use setTimeout to ensure all scripts are loaded
        setTimeout(startInit, 0);
    }
})();

