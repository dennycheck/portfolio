/**
 * Experimental Chameleon Navbar
 * Dynamically changes navbar text color based on content scrolling beneath it
 * Samples actual colors underneath the navbar to determine text color
 * 
 * Version: 3.1 - Improved color sampling with multi-point detection
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
         * Convert RGB to XYZ (D65 white point)
         */
        function rgbToXyz(r, g, b) {
            // Normalize to 0-1
            r = r / 255;
            g = g / 255;
            b = b / 255;
            
            // Apply gamma correction
            r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
            g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
            b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
            
            // Convert to XYZ using sRGB matrix
            const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
            const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
            const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;
            
            return { x, y, z };
        }
        
        /**
         * Convert XYZ to LAB (D65 white point)
         */
        function xyzToLab(x, y, z) {
            // D65 white point
            const xn = 95.047;
            const yn = 100.000;
            const zn = 108.883;
            
            // Normalize by white point
            x = x / xn;
            y = y / yn;
            z = z / zn;
            
            // Apply f function
            const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
            const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
            const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
            
            const l = (116 * fy) - 16;
            const a = 500 * (fx - fy);
            const b = 200 * (fy - fz);
            
            return { l, a, b };
        }
        
        /**
         * Convert LAB to XYZ (D65 white point)
         */
        function labToXyz(l, a, b) {
            // D65 white point
            const xn = 95.047;
            const yn = 100.000;
            const zn = 108.883;
            
            const fy = (l + 16) / 116;
            const fx = a / 500 + fy;
            const fz = fy - b / 200;
            
            const xr = fx > 0.206897 ? Math.pow(fx, 3) : (fx - 16/116) / 7.787;
            const yr = fy > 0.206897 ? Math.pow(fy, 3) : (fy - 16/116) / 7.787;
            const zr = fz > 0.206897 ? Math.pow(fz, 3) : (fz - 16/116) / 7.787;
            
            return {
                x: xr * xn,
                y: yr * yn,
                z: zr * zn
            };
        }
        
        /**
         * Convert XYZ to RGB
         */
        function xyzToRgb(x, y, z) {
            // Normalize from 0-100 to 0-1
            x = x / 100;
            y = y / 100;
            z = z / 100;
            
            // Convert to RGB using sRGB matrix
            let r = x *  3.2404542 + y * -1.5371385 + z * -0.4985314;
            let g = x * -0.9692660 + y *  1.8760108 + z *  0.0415560;
            let b = x *  0.0556434 + y * -0.2040259 + z *  1.0572252;
            
            // Apply gamma correction
            r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
            g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
            b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
            
            // Clamp and convert to 0-255
            r = Math.max(0, Math.min(1, r)) * 255;
            g = Math.max(0, Math.min(1, g)) * 255;
            b = Math.max(0, Math.min(1, b)) * 255;
            
            return {
                r: Math.round(r),
                g: Math.round(g),
                b: Math.round(b)
            };
        }
        
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
         * Convert LAB to LCH (Lightness, Chroma, Hue)
         * LCH is LAB in polar coordinates - hue is explicit
         */
        function labToLch(l, a, b) {
            const c = Math.sqrt(a * a + b * b);
            let h = 0;
            if (c > 0.0001) {
                h = Math.atan2(b, a) * 180 / Math.PI;
                if (h < 0) h += 360;
            }
            return { l: l, c: c, h: h };
        }
        
        /**
         * Convert LCH to LAB (Lightness, Chroma, Hue)
         */
        function lchToLab(l, c, h) {
            const hRad = h * Math.PI / 180;
            const a = c * Math.cos(hRad);
            const b = c * Math.sin(hRad);
            return { l: l, a: a, b: b };
        }
        
        /**
         * Invert color using HSL with hue rotation - simpler and proven to work
         * Rotates hue by 180° for true complements: Green → Magenta, Purple → Yellow, Blue → Orange
         * Middle-tone grays snap to black/white for contrast
         */
        function invertColor(r, g, b) {
            // Convert RGB to HSL
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            // Calculate saturation
            const d = max - min;
            s = max === min ? 0 : (l > 0.5 ? d / (2 - max - min) : d / (max + min));
            
            // Check if this is a middle-tone gray (low saturation, medium lightness)
            // Middle-tone grays have no hue, so hue rotation doesn't help - force black/white for contrast
            if (s < 0.1 && l >= 0.4 && l <= 0.6) {
                // Middle-tone gray - choose black or white based on which has better contrast
                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                // If original is closer to white (luminance > 0.5), use black; otherwise white
                return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
            }
            
            // For pure grays (no saturation at all) - just invert lightness
            if (max === min) {
                const invertedL = 1 - l;
                const gray = Math.round(invertedL * 255);
                return { r: gray, g: gray, b: gray };
            }
            
            // Calculate hue for colored colors
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
            
            h = h * 360; // Convert to degrees
            
            // Rotate hue by 180° for complement
            h = (h + 180) % 360;
            
            // For blue specifically, ensure we get orange not yellow
            if (h >= 55 && h <= 65) {
                h = 30; // Pure orange
            }
            
            // Set saturation to maximum for vibrant colors
            s = 1.0;
            
            // Set lightness for contrast: light backgrounds → dark text, dark backgrounds → light text
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            l = luminance > 0.5 ? 0.35 : 0.65; // Dark for light backgrounds, light for dark backgrounds
            
            // Convert HSL back to RGB
            h = h / 360;
            const hue2rgb = function(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            let r2, g2, b2;
            if (s === 0) {
                r2 = g2 = b2 = l;
            } else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r2 = hue2rgb(p, q, h + 1/3);
                g2 = hue2rgb(p, q, h);
                b2 = hue2rgb(p, q, h - 1/3);
            }
            
            return {
                r: Math.round(r2 * 255),
                g: Math.round(g2 * 255),
                b: Math.round(b2 * 255)
            };
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
         * FIXED: Check 6-digit hex BEFORE 3-digit to avoid #0000ff matching as #000
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
            
            // Handle hex - CRITICAL: match 6-digit FIRST, then 3-digit
            // Otherwise #0000ff matches as #000 (3 digits)
            const hexMatch6 = colorStr.match(/#([0-9a-f]{6})(?:\s|;|$)/i);
            if (hexMatch6) {
                const hex = hexMatch6[1];
                return {
                    r: parseInt(hex.substring(0, 2), 16),
                    g: parseInt(hex.substring(2, 4), 16),
                    b: parseInt(hex.substring(4, 6), 16),
                    alpha: 1
                };
            }
            
            // Try 3-digit hex
            const hexMatch3 = colorStr.match(/#([0-9a-f]{3})(?:\s|;|$)/i);
            if (hexMatch3) {
                const hex3 = hexMatch3[1];
                const hex = hex3.split('').map(function(c) { return c + c; }).join('');
                return {
                    r: parseInt(hex.substring(0, 2), 16),
                    g: parseInt(hex.substring(2, 4), 16),
                    b: parseInt(hex.substring(4, 6), 16),
                    alpha: 1
                };
            }
            
            return null;
        }
        
        /**
         * Extract color from inline style background (gradient, etc)
         * This is the most reliable way to get colors from color blocks
         */
        function getColorFromInlineStyle(element) {
            const inlineStyle = element.getAttribute('style');
            if (!inlineStyle) return null;
            
            // Look for background-color specifically first (most common case for color blocks)
            // Match: "background-color: #0000ff" or "background-color:#0000ff" (with or without spaces)
            const bgColorMatch = inlineStyle.match(/background-color\s*:\s*([^;]+)/i);
            if (bgColorMatch) {
                const colorStr = bgColorMatch[1].trim();
                const rgb = parseColor(colorStr);
                if (rgb && rgb.alpha > 0) {
                    // Return RGB values directly - this is definitive
                    return { r: rgb.r, g: rgb.g, b: rgb.b };
                }
            }
            
            // Look for gradient colors in inline style
            // e.g., "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
            const gradientMatch = inlineStyle.match(/linear-gradient[^)]+\)/);
            if (gradientMatch) {
                // Extract first color from gradient - check 6-digit FIRST
                const colorMatch6 = gradientMatch[0].match(/#([0-9a-f]{6})(?:\s|%|,|\))/i);
                if (colorMatch6) {
                    const hex = colorMatch6[1];
                    return {
                        r: parseInt(hex.substring(0, 2), 16),
                        g: parseInt(hex.substring(2, 4), 16),
                        b: parseInt(hex.substring(4, 6), 16)
                    };
                }
                // Try 3-digit
                const colorMatch3 = gradientMatch[0].match(/#([0-9a-f]{3})(?:\s|%|,|\))/i);
                if (colorMatch3) {
                    const hex3 = colorMatch3[1];
                    const hex = hex3.split('').map(function(c) { return c + c; }).join('');
                    return {
                        r: parseInt(hex.substring(0, 2), 16),
                        g: parseInt(hex.substring(2, 4), 16),
                        b: parseInt(hex.substring(4, 6), 16)
                    };
                }
            }
            
            // Look for solid background color (fallback - less specific)
            const bgMatch = inlineStyle.match(/background\s*:\s*([^;]+)/i);
            if (bgMatch) {
                const colorStr = bgMatch[1].trim();
                // Skip if it's a gradient (already handled above)
                if (!colorStr.includes('gradient')) {
                    const rgb = parseColor(colorStr);
                    if (rgb && rgb.alpha > 0) {
                        return { r: rgb.r, g: rgb.g, b: rgb.b };
                    }
                }
            }
            
            return null;
        }
        
        /**
         * Get background color traversing up DOM tree
         * Prioritizes inline styles which are most reliable for color blocks
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
            
            // CRITICAL: Always check inline style first - this is most reliable for color blocks
            // Inline styles like "background-color: #0000ff" are definitive
            const inlineColor = getColorFromInlineStyle(element);
            if (inlineColor) {
                return inlineColor;
            }
            
            // Check computed style - but be careful, computed styles might be "rgb(0, 0, 255)" 
            // which should parse correctly, but let's verify the format
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const rgb = parseColor(bgColor);
            
            // If we found a solid, opaque background color (not transparent), use it
            // This handles cases where computed style returns "rgb(0, 0, 255)" for blue
            if (rgb && rgb.alpha > 0.95) {
                return { r: rgb.r, g: rgb.g, b: rgb.b };
            }
            
            // If semi-transparent, blend with parent (but only if we have a valid color)
            if (rgb && rgb.alpha > 0.05 && rgb.alpha < 0.95 && element.parentElement) {
                const parentColor = getBackgroundColor(element.parentElement, depth + 1);
                return {
                    r: Math.round(rgb.r * rgb.alpha + parentColor.r * (1 - rgb.alpha)),
                    g: Math.round(rgb.g * rgb.alpha + parentColor.g * (1 - rgb.alpha)),
                    b: Math.round(rgb.b * rgb.alpha + parentColor.b * (1 - rgb.alpha))
                };
            }
            
            // If transparent or no color, check parent
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
                
                if (!hitElement) {
                    if (window._chameleonDebugEnabled) {
                        console.log('Chameleon navbar: sampleElementCorners - No element at point', i, point);
                    }
                    return;
                }
                
                if (window._chameleonDebugEnabled) {
                    console.log('Chameleon navbar: sampleElementCorners - Point', i, 'hit:', hitElement.tagName, hitElement.className || '(no class)', 'style:', hitElement.getAttribute('style'));
                }
                
                // Skip navbar and its children (except the element we're sampling for)
                if ((hitElement === navbar || navbar.contains(hitElement)) && 
                    hitElement !== element && !element.contains(hitElement)) {
                    if (window._chameleonDebugEnabled) {
                        console.log('Chameleon navbar: sampleElementCorners - Skipping navbar');
                    }
                    return;
                }
                
                // Skip body/html
                if (hitElement === document.body || hitElement === document.documentElement) {
                    if (window._chameleonDebugEnabled) {
                        console.log('Chameleon navbar: sampleElementCorners - Skipping body/html');
                    }
                    return;
                }
                
                const bgColor = getBackgroundColor(hitElement);
                if (window._chameleonDebugEnabled) {
                    console.log('Chameleon navbar: sampleElementCorners - Got color:', bgColor, 'from element:', hitElement);
                }
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
         * Sample pixel color directly from an img element at screen coordinates
         * Uses Canvas API to read actual pixel data from the image
         */
        function samplePixelFromImage(img, screenX, screenY) {
            if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
                return null;
            }
            
            try {
                // Get the image's bounding rect (where it's actually displayed)
                const imgRect = img.getBoundingClientRect();
                
                // Calculate relative coordinates within the displayed image
                const relativeX = screenX - imgRect.left;
                const relativeY = screenY - imgRect.top;
                
                // Check if point is within displayed image bounds
                if (relativeX < 0 || relativeY < 0 || relativeX >= imgRect.width || relativeY >= imgRect.height) {
                    return null;
                }
                
                // Create a canvas and draw the image
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw the image to canvas - this might fail with CORS
                ctx.drawImage(img, 0, 0);
                
                // Calculate pixel coordinates in the image's natural size
                // Map from displayed size to natural size
                const pixelX = Math.floor((relativeX / imgRect.width) * img.naturalWidth);
                const pixelY = Math.floor((relativeY / imgRect.height) * img.naturalHeight);
                
                // Clamp to valid range
                const clampedX = Math.max(0, Math.min(img.naturalWidth - 1, pixelX));
                const clampedY = Math.max(0, Math.min(img.naturalHeight - 1, pixelY));
                
                // Sample the pixel - this will throw if canvas is tainted (CORS issue)
                const imageData = ctx.getImageData(clampedX, clampedY, 1, 1);
                const data = imageData.data;
                
                return {
                    r: data[0],
                    g: data[1],
                    b: data[2],
                    a: data[3] / 255
                };
            } catch (e) {
                // CORS/tainted canvas error - cannot read pixels from this image
                // This is the most common reason image sampling fails
                // The image needs to be served with proper CORS headers or from same origin
                console.warn('Chameleon navbar: Cannot sample image pixel (likely CORS):', e.message, img.src);
                return null;
            }
        }
        
        /**
         * Find all img elements that could contain the given point
         * Returns array of {img, x, y} where x,y are clamped to image bounds
         */
        function findImageElementsAtPoint(screenX, screenY) {
            const results = [];
            
            // Get all img elements on the page
            const allImages = document.querySelectorAll('img');
            
            for (let i = 0; i < allImages.length; i++) {
                const img = allImages[i];
                
                // Skip if not loaded
                if (!img.complete || img.naturalWidth === 0) continue;
                
                // Skip if hidden
                const style = window.getComputedStyle(img);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
                
                const rect = img.getBoundingClientRect();
                
                // Check if point is within image bounds (with small padding for edge cases)
                if (screenX >= rect.left && screenX <= rect.right &&
                    screenY >= rect.top && screenY <= rect.bottom) {
                    // Clamp coordinates to image bounds
                    const clampedX = Math.max(rect.left, Math.min(rect.right, screenX));
                    const clampedY = Math.max(rect.top, Math.min(rect.bottom, screenY));
                    results.push({ img: img, x: clampedX, y: clampedY });
                }
            }
            
            // Sort by z-index/depth (elements later in DOM are on top)
            // We'll use the order in the array, but prioritize elements that are actually visible
            return results;
        }
        
        /**
         * Sample color at a specific point - prioritizes image pixel sampling
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
            
            // Sample at multiple nearby points
            const samplePoints = [
                { x: x, y: y },
                { x: x - 2, y: y },
                { x: x + 2, y: y },
                { x: x, y: y - 2 },
                { x: x, y: y + 2 }
            ];
            
            const colors = [];
            
            // FIRST: Try to sample from images at each point
            for (let i = 0; i < samplePoints.length; i++) {
                const point = samplePoints[i];
                const imageResults = findImageElementsAtPoint(point.x, point.y);
                
                // Use the last image found (topmost in DOM, likely on top visually)
                if (imageResults.length > 0) {
                    const topImage = imageResults[imageResults.length - 1];
                    const pixelColor = samplePixelFromImage(topImage.img, topImage.x, topImage.y);
                    if (pixelColor && pixelColor.a > 0.1) {
                        colors.push({ r: pixelColor.r, g: pixelColor.g, b: pixelColor.b });
                        continue; // Found image color, skip CSS fallback for this point
                    }
                }
                
                // SECOND: Fall back to CSS background color sampling
                const hitElement = document.elementFromPoint(point.x, point.y);
                
                if (!hitElement) continue;
                
                // Skip navbar and its children
                if (hitElement === navbar || navbar.contains(hitElement)) continue;
                
                // Skip body/html
                if (hitElement === document.body || hitElement === document.documentElement) continue;
                
                let current = hitElement;
                
                // Check current element and all parents up to body
                while (current && current !== document.body && current !== document.documentElement) {
                    // Check inline style first (most reliable)
                    const inlineColor = getColorFromInlineStyle(current);
                    if (inlineColor) {
                        colors.push(inlineColor);
                        break;
                    }
                    
                    // Check computed style
                    const style = window.getComputedStyle(current);
                    const bgColor = style.backgroundColor;
                    const rgb = parseColor(bgColor);
                    if (rgb && rgb.alpha > 0.95) {
                        colors.push({ r: rgb.r, g: rgb.g, b: rgb.b });
                        break;
                    }
                    
                    current = current.parentElement;
                }
            }
            
            // Restore pointer events
            navbar.style.pointerEvents = originalPointerEvents || '';
            
            if (colors.length === 0) {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                return isDarkMode ? { r: 23, g: 23, b: 23 } : { r: 255, g: 255, b: 255 };
            }
            
            // Return the first color (they should be similar from nearby points)
            return colors[0];
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
