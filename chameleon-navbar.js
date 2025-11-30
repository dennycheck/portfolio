/**
 * Experimental Chameleon Navbar
 * Dynamically changes navbar text color based on content scrolling beneath it
 * Samples actual colors underneath the navbar to determine text color
 */

(function() {
    'use strict';
    
    function initChameleonNavbar() {
        const navbar = document.querySelector('.navbar--chameleon');
        if (!navbar) {
            console.error('Chameleon navbar: Navbar element not found');
            return;
        }
        console.log('Chameleon navbar: Found navbar element', navbar);
        
        /**
         * Convert RGB to HSL
         */
        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            
            return { h: h * 360, s: s * 100, l: l * 100 };
        }
        
        /**
         * Convert HSL to RGB
         */
        function hslToRgb(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = function(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }
        
        /**
         * Invert color with more natural handling of neutral colors
         */
        function invertColor(r, g, b) {
            const hsl = rgbToHsl(r, g, b);
            
            // For neutral/low saturation colors (grays), ensure contrast
            if (hsl.s < 20) {
                // Low saturation - treat as neutral
                // If it's a middle gray (lightness 40-60%), choose black or white for contrast
                if (hsl.l >= 40 && hsl.l <= 60) {
                    // Middle gray - choose black or white based on which has better contrast
                    // Calculate relative luminance for contrast ratio
                    const l1 = hsl.l / 100; // Original lightness as 0-1
                    const l2Black = 0; // Black luminance
                    const l2White = 1; // White luminance
                    
                    // WCAG contrast ratio: (L1 + 0.05) / (L2 + 0.05)
                    const contrastWithBlack = (l1 + 0.05) / (l2Black + 0.05);
                    const contrastWithWhite = (l2White + 0.05) / (l1 + 0.05);
                    
                    // Choose the one with better contrast (higher ratio)
                    if (contrastWithBlack > contrastWithWhite) {
                        return { r: 0, g: 0, b: 0 }; // Black
                    } else {
                        return { r: 255, g: 255, b: 255 }; // White
                    }
                }
                // For non-middle grays, just invert lightness
                const invertedL = 100 - hsl.l;
                return hslToRgb(hsl.h, hsl.s, invertedL);
            }
            
            // For colored/high saturation colors, invert hue and adjust saturation/lightness
            // Invert hue (add 180 degrees, wrap around)
            let invertedH = (hsl.h + 180) % 360;
            
            // For saturation: if very saturated, reduce it slightly; if medium, invert it
            let invertedS;
            if (hsl.s > 80) {
                // Very saturated - reduce saturation for more natural look
                invertedS = 100 - hsl.s * 0.7;
            } else {
                // Medium/low saturation - invert it
                invertedS = 100 - hsl.s;
            }
            
            // Invert lightness (complement)
            const invertedL = 100 - hsl.l;
            
            // Check if the inverted color is also a middle gray - if so, push to extreme
            if (invertedL >= 40 && invertedL <= 60 && invertedS < 30) {
                // Inverted color is also a middle gray - choose black or white for contrast
                const l1 = invertedL / 100;
                const contrastWithBlack = (l1 + 0.05) / 0.05;
                const contrastWithWhite = 1.05 / (l1 + 0.05);
                
                if (contrastWithBlack > contrastWithWhite) {
                    return { r: 0, g: 0, b: 0 };
                } else {
                    return { r: 255, g: 255, b: 255 };
                }
            }
            
            // Convert back to RGB
            return hslToRgb(invertedH, invertedS, invertedL);
        }
        
        /**
         * Get maximum contrast color (reinvert for text on colored background)
         */
        function getContrastColor(r, g, b) {
            // Simply invert lightness for maximum contrast
            const hsl = rgbToHsl(r, g, b);
            const contrastL = hsl.l > 50 ? 0 : 100; // Black if light, white if dark
            return hslToRgb(hsl.h, hsl.s, contrastL);
        }
        
        /**
         * Convert RGB color to relative luminance (0-1) - for determining if we need white/black text
         */
        function getLuminance(r, g, b) {
            const [rs, gs, bs] = [r, g, b].map(function(val) {
                val = val / 255;
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        
        /**
         * Parse CSS color string to RGB values
         */
        function parseColor(colorStr) {
            if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
                return null;
            }
            
            // Handle rgb/rgba
            const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (rgbMatch) {
                const alphaMatch = colorStr.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
                return {
                    r: parseInt(rgbMatch[1], 10),
                    g: parseInt(rgbMatch[2], 10),
                    b: parseInt(rgbMatch[3], 10),
                    alpha: alphaMatch ? parseFloat(alphaMatch[1]) : 1
                };
            }
            
            // Handle hex
            const hexMatch = colorStr.match(/#([0-9a-f]{3}|[0-9a-f]{6})/i);
            if (hexMatch) {
                let hex = hexMatch[1];
                if (hex.length === 3) {
                    hex = hex.split('').map(function(c) { return c + c; }).join('');
                }
                return {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16),
                    alpha: 1
                };
            }
            
            return null;
        }
        
        /**
         * Extract color from inline style background (gradient, etc)
         */
        function getColorFromInlineStyle(element) {
            const inlineStyle = element.getAttribute('style');
            if (!inlineStyle) return null;
            
            // Look for gradient colors in inline style
            // e.g., "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
            const gradientMatch = inlineStyle.match(/linear-gradient[^)]+\)/);
            if (gradientMatch) {
                // Extract first color from gradient
                const colorMatch = gradientMatch[0].match(/#([0-9a-f]{3}|[0-9a-f]{6})/i);
                if (colorMatch) {
                    let hex = colorMatch[1];
                    if (hex.length === 3) {
                        hex = hex.split('').map(function(c) { return c + c; }).join('');
                    }
                    return {
                        r: parseInt(hex.substr(0, 2), 16),
                        g: parseInt(hex.substr(2, 2), 16),
                        b: parseInt(hex.substr(4, 2), 16)
                    };
                }
            }
            
            // Look for solid background color
            const bgColorMatch = inlineStyle.match(/background[^:]*:\s*([^;]+)/);
            if (bgColorMatch) {
                const rgb = parseColor(bgColorMatch[1].trim());
                if (rgb) return { r: rgb.r, g: rgb.g, b: rgb.b };
            }
            
            return null;
        }
        
        /**
         * Get background color traversing up DOM tree
         */
        function getBackgroundColor(element, depth = 0) {
            if (!element || depth > 15) {
                // If we've gone too deep, get the actual body background color
                const bodyStyle = window.getComputedStyle(document.body);
                const bodyBg = parseColor(bodyStyle.backgroundColor);
                if (bodyBg) {
                    return { r: bodyBg.r, g: bodyBg.g, b: bodyBg.b };
                }
                // Last resort: check if dark mode
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // If we hit body, get its actual background color
            if (element === document.body || element === document.documentElement) {
                const style = window.getComputedStyle(element);
                const bgColor = style.backgroundColor;
                const rgb = parseColor(bgColor);
                if (rgb && rgb.alpha > 0.05) {
                    return { r: rgb.r, g: rgb.g, b: rgb.b };
                }
                // If body is transparent, check html element
                if (element === document.body && element.parentElement) {
                    return getBackgroundColor(element.parentElement, depth + 1);
                }
                // Default based on dark mode
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // First check inline style (for gradients, etc)
            const inlineColor = getColorFromInlineStyle(element);
            if (inlineColor) {
                console.log('Chameleon navbar: Found inline color:', inlineColor, 'from element:', element.className || element.tagName);
                return inlineColor;
            }
            
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const rgb = parseColor(bgColor);
            
            if (rgb && rgb.alpha > 0.05) {
                if (rgb.alpha < 0.95 && element.parentElement) {
                    const parentColor = getBackgroundColor(element.parentElement, depth + 1);
                    return {
                        r: Math.round(rgb.r * rgb.alpha + parentColor.r * (1 - rgb.alpha)),
                        g: Math.round(rgb.g * rgb.alpha + parentColor.g * (1 - rgb.alpha)),
                        b: Math.round(rgb.b * rgb.alpha + parentColor.b * (1 - rgb.alpha))
                    };
                }
                return { r: rgb.r, g: rgb.g, b: rgb.b };
            }
            
            if (element.parentElement) {
                return getBackgroundColor(element.parentElement, depth + 1);
            }
            
            // Final fallback - check dark mode
            const isDarkMode = document.documentElement.classList.contains('dark') || 
                               window.matchMedia('(prefers-color-scheme: dark)').matches;
            return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
        }
        
        /**
         * Show visual markers for element corners
         */
        function showElementCornerMarkers(element, elementName) {
            const rect = element.getBoundingClientRect();
            const corners = [
                { x: rect.left + 2, y: rect.top + 2, label: 'TL' },
                { x: rect.right - 2, y: rect.top + 2, label: 'TR' },
                { x: rect.left + 2, y: rect.bottom - 2, label: 'BL' },
                { x: rect.right - 2, y: rect.bottom - 2, label: 'BR' }
            ];
            
            corners.forEach(function(corner) {
                const marker = document.createElement('div');
                marker.className = 'chameleon-sampling-marker';
                marker.style.cssText = `
                    position: fixed;
                    left: ${corner.x - 4}px;
                    top: ${corner.y - 4}px;
                    width: 8px;
                    height: 8px;
                    background-color: rgba(255, 0, 0, 0.8);
                    border: 1px solid #ffffff;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 99999;
                    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
                `;
                document.body.appendChild(marker);
            });
        }
        
        /**
         * Show visual markers for all navbar elements
         */
        function showAllMarkers() {
            // Remove existing markers
            const existingMarkers = document.querySelectorAll('.chameleon-sampling-marker');
            existingMarkers.forEach(function(marker) {
                marker.remove();
            });
            
            // Show markers for each element
            const logo = navbar.querySelector('.navbar__logo');
            if (logo) showElementCornerMarkers(logo, 'logo');
            
            const links = navbar.querySelectorAll('.navbar__link');
            links.forEach(function(link, i) {
                showElementCornerMarkers(link, 'link ' + i);
            });
            
            const buttons = navbar.querySelectorAll('.btn');
            buttons.forEach(function(btn, i) {
                showElementCornerMarkers(btn, 'button ' + i);
            });
        }
        
        /**
         * Sample colors underneath navbar
         */
        function sampleColorUnderNavbar() {
            const navbarRect = navbar.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            
            // If we're at the very top of the page, sample the body background directly
            if (scrollY < 50) {
                console.log('Chameleon navbar: At top of page, sampling body background');
                const bodyStyle = window.getComputedStyle(document.body);
                const bodyBg = parseColor(bodyStyle.backgroundColor);
                if (bodyBg && bodyBg.alpha > 0.05) {
                    console.log('Chameleon navbar: Body background color:', bodyBg);
                    return { r: bodyBg.r, g: bodyBg.g, b: bodyBg.b };
                }
                // Fallback to dark mode detection
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                const defaultColor = isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
                console.log('Chameleon navbar: Using default color for top:', defaultColor);
                return defaultColor;
            }
            
            // Temporarily disable pointer events
            const originalPointerEvents = navbar.style.pointerEvents;
            navbar.style.pointerEvents = 'none';
            
            // Sample at multiple X positions across the navbar width
            // Avoid the left edge where logo/text might be, and right edge where buttons are
            // Sample points are positioned to avoid hitting navbar content
            const samplePoints = [
                navbarRect.left + 10, // Far left, before any content
                navbarRect.left + navbarRect.width * 0.2,
                navbarRect.left + navbarRect.width * 0.35,
                navbarRect.left + navbarRect.width * 0.5,
                navbarRect.left + navbarRect.width * 0.65,
                navbarRect.left + navbarRect.width * 0.8,
                navbarRect.right - 10 // Far right, after buttons
            ];
            
            // Single Y position - middle of the navbar (since it's transparent, we can see through it)
            const sampleY = navbarRect.top + (navbarRect.height / 2);
            
            const colors = [];
            
            samplePoints.forEach(function(x, i) {
                const element = document.elementFromPoint(x, sampleY);
                
                if (!element) {
                    console.log('Chameleon navbar: Point', i, '- No element');
                    return;
                }
                
                // Skip navbar and its children
                if (element === navbar || navbar.contains(element)) {
                    console.log('Chameleon navbar: Point', i, '- Hit navbar');
                    return;
                }
                
                // Skip body/html
                if (element === document.body || element === document.documentElement) {
                    console.log('Chameleon navbar: Point', i, '- Hit body/html');
                    return;
                }
                
                console.log('Chameleon navbar: Point', i, '- Element:', element.tagName, element.className || '(no class)');
                const bgColor = getBackgroundColor(element);
                console.log('Chameleon navbar: Point', i, '- Color:', bgColor);
                colors.push(bgColor);
            });
            
            // Restore pointer events
            navbar.style.pointerEvents = originalPointerEvents || '';
            
            if (colors.length === 0) {
                console.log('Chameleon navbar: No valid colors sampled, defaulting to white');
                // In dark mode, default to light color
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches ||
                                   document.body.style.colorScheme === 'dark';
                return isDarkMode ? { r: 17, g: 17, b: 17 } : { r: 255, g: 255, b: 255 };
            }
            
            // Average colors
            const avgColor = {
                r: Math.round(colors.reduce(function(sum, c) { return sum + c.r; }, 0) / colors.length),
                g: Math.round(colors.reduce(function(sum, c) { return sum + c.g; }, 0) / colors.length),
                b: Math.round(colors.reduce(function(sum, c) { return sum + c.b; }, 0) / colors.length)
            };
            
            console.log('Chameleon navbar: Average color RGB:', avgColor);
            return avgColor;
        }
        
        /**
         * Sample colors at 2 points along the equator (horizontal midline) of an element
         */
        function sampleElementCorners(element) {
            const rect = element.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            
            // If at top of page, use body background
            if (scrollY < 50) {
                const bodyStyle = window.getComputedStyle(document.body);
                const bodyBg = parseColor(bodyStyle.backgroundColor);
                if (bodyBg && bodyBg.alpha > 0.05) {
                    return { r: bodyBg.r, g: bodyBg.g, b: bodyBg.b };
                }
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Temporarily disable pointer events on navbar
            const originalPointerEvents = navbar.style.pointerEvents;
            navbar.style.pointerEvents = 'none';
            
            // Calculate equator (horizontal midline) Y position
            const equatorY = rect.top + (rect.height / 2);
            
            // Sample at 2 points along the equator: 25% and 75% of width
            const samplePoints = [
                { x: rect.left + (rect.width * 0.25), y: equatorY }, // 25% along equator
                { x: rect.left + (rect.width * 0.75), y: equatorY }  // 75% along equator
            ];
            
            const colors = [];
            
            samplePoints.forEach(function(point, i) {
                const hitElement = document.elementFromPoint(point.x, point.y);
                
                if (!hitElement) return;
                
                // Skip navbar and its children (except the element we're sampling for)
                if ((hitElement === navbar || navbar.contains(hitElement)) && 
                    hitElement !== element && !element.contains(hitElement)) {
                    return;
                }
                
                // Skip body/html
                if (hitElement === document.body || hitElement === document.documentElement) {
                    return;
                }
                
                const bgColor = getBackgroundColor(hitElement);
                colors.push(bgColor);
            });
            
            // Restore pointer events
            navbar.style.pointerEvents = originalPointerEvents || '';
            
            if (colors.length === 0) {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Average the sampled colors
            return {
                r: Math.round(colors.reduce(function(sum, c) { return sum + c.r; }, 0) / colors.length),
                g: Math.round(colors.reduce(function(sum, c) { return sum + c.g; }, 0) / colors.length),
                b: Math.round(colors.reduce(function(sum, c) { return sum + c.b; }, 0) / colors.length)
            };
        }
        
        /**
         * Wrap text nodes into character spans for independent color control
         */
        function wrapTextIntoCharacters(element) {
            // Only process text nodes, skip if already wrapped
            if (element.querySelector('.chameleon-char')) {
                return;
            }
            
            function processNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    if (text.trim().length === 0) return; // Skip whitespace-only nodes
                    
                    const fragment = document.createDocumentFragment();
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const span = document.createElement('span');
                        span.className = 'chameleon-char';
                        span.textContent = char;
                        // Preserve whitespace
                        if (char === ' ') {
                            span.style.whiteSpace = 'pre';
                        }
                        fragment.appendChild(span);
                    }
                    node.parentNode.replaceChild(fragment, node);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Process child nodes (but skip SVG and icon elements)
                    if (node.tagName === 'SVG' || node.classList.contains('btn__icon') || node.classList.contains('icon')) {
                        return;
                    }
                    const children = Array.from(node.childNodes);
                    children.forEach(processNode);
                }
            }
            
            const children = Array.from(element.childNodes);
            children.forEach(processNode);
        }
        
        /**
         * Sample color at a specific point - only samples background colors
         */
        function sampleColorAtPoint(x, y) {
            const scrollY = window.scrollY || window.pageYOffset;
            
            // If at top of page, use body background
            if (scrollY < 50) {
                const bodyStyle = window.getComputedStyle(document.body);
                const bodyBg = parseColor(bodyStyle.backgroundColor);
                if (bodyBg && bodyBg.alpha > 0.05) {
                    return { r: bodyBg.r, g: bodyBg.g, b: bodyBg.b };
                }
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Temporarily disable pointer events on navbar
            const originalPointerEvents = navbar.style.pointerEvents;
            navbar.style.pointerEvents = 'none';
            
            const hitElement = document.elementFromPoint(x, y);
            
            // Restore pointer events
            navbar.style.pointerEvents = originalPointerEvents || '';
            
            if (!hitElement) {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Skip navbar and its children
            if (hitElement === navbar || navbar.contains(hitElement)) {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Skip body/html
            if (hitElement === document.body || hitElement === document.documentElement) {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Only sample background color, ignore text
            return getBackgroundColor(hitElement);
        }
        
        /**
         * Update a single navbar element's color (for non-text elements like buttons)
         */
        function updateElementColor(element, elementName) {
            const bgColor = sampleElementCorners(element);
            const invertedColor = invertColor(bgColor.r, bgColor.g, bgColor.b);
            const hexColor = '#' + 
                invertedColor.r.toString(16).padStart(2, '0') +
                invertedColor.g.toString(16).padStart(2, '0') +
                invertedColor.b.toString(16).padStart(2, '0');
            
            // Apply color to element based on its type
            if (element.classList.contains('btn--ghost')) {
                element.style.cssText += `color: ${hexColor} !important; border-color: transparent !important;`;
            } else if (element.classList.contains('btn--primary')) {
                // For primary button, reinvert the fill color for maximum contrast text
                const contrastColor = getContrastColor(invertedColor.r, invertedColor.g, invertedColor.b);
                const contrastHex = '#' + 
                    contrastColor.r.toString(16).padStart(2, '0') +
                    contrastColor.g.toString(16).padStart(2, '0') +
                    contrastColor.b.toString(16).padStart(2, '0');
                element.style.cssText += `background-color: ${hexColor} !important; border-color: ${hexColor} !important; color: ${contrastHex} !important;`;
            }
            
            // Update SVG icons inside this element
            const svgs = element.querySelectorAll('svg');
            svgs.forEach(function(svg) {
                svg.style.cssText += `fill: ${hexColor} !important; color: ${hexColor} !important;`;
            });
            
            console.log('Chameleon navbar: Updated', elementName, 'color to', hexColor);
        }
        
        /**
         * Update text element with character-level color sampling
         */
        function updateTextElementColor(element, elementName) {
            // Ensure text is wrapped into character spans
            wrapTextIntoCharacters(element);
            
            // Get all character spans
            const charSpans = element.querySelectorAll('.chameleon-char');
            
            if (charSpans.length === 0) {
                // Fallback to element-level sampling if no characters found
                const bgColor = sampleElementCorners(element);
                const invertedColor = invertColor(bgColor.r, bgColor.g, bgColor.b);
                const hexColor = '#' + 
                    invertedColor.r.toString(16).padStart(2, '0') +
                    invertedColor.g.toString(16).padStart(2, '0') +
                    invertedColor.b.toString(16).padStart(2, '0');
                element.style.cssText += `color: ${hexColor} !important;`;
                return;
            }
            
            // Sample and update each character independently
            charSpans.forEach(function(span) {
                const rect = span.getBoundingClientRect();
                // Sample at the center of the character
                const centerX = rect.left + (rect.width / 2);
                const centerY = rect.top + (rect.height / 2);
                
                const bgColor = sampleColorAtPoint(centerX, centerY);
                const invertedColor = invertColor(bgColor.r, bgColor.g, bgColor.b);
                const hexColor = '#' + 
                    invertedColor.r.toString(16).padStart(2, '0') +
                    invertedColor.g.toString(16).padStart(2, '0') +
                    invertedColor.b.toString(16).padStart(2, '0');
                
                span.style.color = hexColor;
            });
            
            console.log('Chameleon navbar: Updated', elementName, 'with', charSpans.length, 'characters');
        }
        
        /**
         * Update navbar colors - each character samples independently for text elements
         */
        function updateNavbarColors() {
            console.log('Chameleon navbar: Updating colors with character-level sampling...');
            
            // Update logo with character-level sampling
            const logo = navbar.querySelector('.navbar__logo');
            if (logo) {
                updateTextElementColor(logo, 'logo');
            }
            
            // Update each link with character-level sampling
            const links = navbar.querySelectorAll('.navbar__link');
            links.forEach(function(link, i) {
                updateTextElementColor(link, 'link ' + i);
            });
            
            // Update each button (buttons don't have text, so use element-level)
            const buttons = navbar.querySelectorAll('.btn');
            buttons.forEach(function(btn, i) {
                // Skip buttons that contain text spans (like "Get Started")
                const textSpans = btn.querySelectorAll('.chameleon-char');
                if (textSpans.length > 0) {
                    updateTextElementColor(btn, 'button ' + i);
                } else {
                    updateElementColor(btn, 'button ' + i);
                }
            });
        }
        
        // Throttle scroll
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateNavbarColors();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        // Initial update immediately and after delay to ensure it runs
        updateNavbarColors(); // Run immediately
        setTimeout(function() {
            console.log('Chameleon navbar: Initial update (delayed)');
            updateNavbarColors();
        }, 100);
        setTimeout(function() {
            console.log('Chameleon navbar: Initial update (final)');
            updateNavbarColors();
        }, 500);
        
        // Scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Resize listener
        window.addEventListener('resize', function() {
            setTimeout(updateNavbarColors, 100);
        }, { passive: true });
        
        console.log('Chameleon navbar: Initialized');
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChameleonNavbar);
    } else {
        initChameleonNavbar();
    }
})();
