# Component System Documentation

## Overview
This portfolio uses a modular, reusable component system built with CSS. The system is designed to be flexible, extensible, and supports alternative stylesheets for complete theme switching.

## Architecture

### CSS Variables (Theme System)
All design tokens are defined as CSS variables in `:root`, making it easy to:
- Create alternative themes by overriding variables
- Swap entire stylesheets for different visual styles
- Maintain consistency across components

### Component Structure
Components are organized using BEM-like naming conventions:
- Base class: `.btn`
- Modifiers: `.btn--primary`, `.btn--sm`
- States: `.btn--disabled`, `.btn--loading`

## Button Component

### Usage
```html
<button class="btn btn--primary">Click Me</button>
```

### Variants
- `.btn--primary` - Primary action button
- `.btn--secondary` - Secondary action button
- `.btn--outline` - Outlined button
- `.btn--ghost` - Minimal ghost button

### Sizes
- `.btn--sm` - Small button
- Default - Medium button (no modifier)
- `.btn--lg` - Large button

### States
- `.btn--disabled` - Disabled state
- `.btn--loading` - Loading state with spinner

## Creating Alternative Themes

To create an alternative theme:

1. Create a new CSS file (e.g., `themes/dark.css`)
2. Override CSS variables:
```css
:root {
    --color-primary: #your-color;
    --color-bg: #your-bg;
    /* ... override other variables */
}
```
3. Link it in HTML:
```html
<link rel="stylesheet" href="themes/dark.css">
```

## Adding New Components

1. Define component base class
2. Use CSS variables for theming
3. Create modifier classes for variations
4. Document in this file

