/**
 * Theme Toggle System
 * Handles switching between light and dark themes
 */

(function() {
    'use strict';
    
    const THEME_STORAGE_KEY = 'portfolio-theme';
    const THEME_ATTRIBUTE = 'data-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';
    
    // Get theme from localStorage or default to light
    function getStoredTheme() {
        return localStorage.getItem(THEME_STORAGE_KEY) || LIGHT_THEME;
    }
    
    // Save theme to localStorage
    function saveTheme(theme) {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    
    // Apply theme to document
    function applyTheme(theme) {
        const html = document.documentElement;
        const themeLink = document.getElementById('theme-stylesheet');
        
        html.setAttribute(THEME_ATTRIBUTE, theme);
        
        if (theme === DARK_THEME) {
            if (!themeLink) {
                const link = document.createElement('link');
                link.id = 'theme-stylesheet';
                link.rel = 'stylesheet';
                link.href = 'themes/dark.css';
                document.head.appendChild(link);
            }
        } else {
            if (themeLink) {
                themeLink.remove();
            }
        }
        
        saveTheme(theme);
        updateThemeToggleButton(theme);
    }
    
    // Update toggle button appearance
    async function updateThemeToggleButton(theme) {
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        
        for (const button of buttons) {
            const icon = button.querySelector('.theme-toggle__icon');
            if (icon) {
                const iconName = theme === DARK_THEME ? 'sun' : 'moon';
                
                // Load icon SVG
                if (window.iconLoader) {
                    const svgContent = await window.iconLoader.load(iconName, 20, 'solid');
                    if (svgContent) {
                        icon.innerHTML = svgContent;
                        const svg = icon.querySelector('svg');
                        if (svg) {
                            svg.setAttribute('fill', 'currentColor');
                            svg.style.width = '20px';
                            svg.style.height = '20px';
                        }
                    }
                }
                
                if (theme === DARK_THEME) {
                    button.setAttribute('aria-label', 'Switch to light theme');
                } else {
                    button.setAttribute('aria-label', 'Switch to dark theme');
                }
            }
            button.setAttribute('aria-pressed', theme === DARK_THEME ? 'true' : 'false');
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE) || getStoredTheme();
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
    }
    
    // Initialize theme on page load
    function initTheme() {
        const storedTheme = getStoredTheme();
        
        // Wait for icons to load before updating theme toggle button
        if (window.iconLoader) {
            applyTheme(storedTheme);
        } else {
            // If iconLoader isn't ready, wait for it
            window.addEventListener('iconsLoaded', () => {
                applyTheme(storedTheme);
            }, { once: true });
            
            // Fallback: try after a short delay
            setTimeout(() => {
                if (window.iconLoader) {
                    applyTheme(storedTheme);
                }
            }, 100);
        }
        
        // Add click handlers to all theme toggle buttons
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            button.addEventListener('click', toggleTheme);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
    
    // Expose toggle function globally for external use
    window.themeToggle = {
        toggle: toggleTheme,
        setTheme: applyTheme,
        getTheme: function() {
            return document.documentElement.getAttribute(THEME_ATTRIBUTE) || getStoredTheme();
        }
    };
})();

