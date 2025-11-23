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

## Navigation Bar Component

### Usage
```html
<nav class="navbar">
    <div class="navbar__slot navbar__slot--left">
        <!-- Left content: Logo, etc. -->
    </div>
    <div class="navbar__slot navbar__slot--center">
        <!-- Center content: Navigation links -->
    </div>
    <div class="navbar__slot navbar__slot--right">
        <!-- Right content: Buttons, etc. -->
    </div>
</nav>
```

### Structure
The navbar uses a three-slot system for flexible alignment:
- `.navbar__slot--left` - Left-aligned content (logo, branding)
- `.navbar__slot--center` - Center-aligned content (navigation links)
- `.navbar__slot--right` - Right-aligned content (buttons, actions)

### Navbar Variants
- `.navbar--fixed` - Fixed to top of viewport
- `.navbar--sticky` - Sticks to top when scrolling
- `.navbar--transparent` - Transparent background
- `.navbar--solid` - Solid background with shadow

### Logo/Brand
```html
<a href="#" class="navbar__logo">Your Logo</a>
<!-- Or with image -->
<a href="#" class="navbar__logo">
    <img src="logo.png" alt="Logo">
</a>
```

### Navigation Links
```html
<ul class="navbar__nav">
    <li><a href="#" class="navbar__link">Home</a></li>
    <li><a href="#" class="navbar__link navbar__link--active">About</a></li>
</ul>
```

### Integration with Buttons
Buttons can be placed in any slot:
```html
<div class="navbar__slot navbar__slot--right">
    <button class="btn btn--primary">Action</button>
</div>
```

### Responsive Behavior
- On mobile (≤768px), center slot is hidden by default
- Navigation links adjust spacing and font size
- Mobile menu toggle available for future implementation

## Tile Grid System

### Usage
```html
<div class="tile-grid tile-grid--auto">
    <a href="#" class="tile tile--shadow">
        <div class="tile__body">
            <h3 class="tile__title">Tile Title</h3>
            <p class="tile__text">Tile content goes here.</p>
        </div>
    </a>
</div>
```

### Grid Layout Options

#### Fixed Column Grids
- `.tile-grid--cols-1` through `.tile-grid--cols-6` - Fixed number of columns
- Responsive: Automatically adjusts on smaller screens

#### Auto-fit Responsive Grids
- `.tile-grid--auto` - Auto-fit with 250px minimum (default)
- `.tile-grid--auto-sm` - 200px minimum width
- `.tile-grid--auto-lg` - 300px minimum width
- `.tile-grid--auto-xl` - 400px minimum width

### Tile Structure
Tiles support flexible content areas:
- `.tile__header` - Optional header section
- `.tile__body` - Main content area (flexible)
- `.tile__footer` - Optional footer section

### Tile as Link
Tiles can function as links:
```html
<a href="#" class="tile tile--shadow">
    <!-- Tile content -->
</a>
```

### Tile Variants
- `.tile--shadow` - With shadow and hover effect
- `.tile--bordered` - With prominent border
- `.tile--flat` - Minimal style with subtle hover

### Tile Spanning
Control tile width within the grid:
- `.tile--span-2` - Span 2 columns
- `.tile--span-3` - Span 3 columns
- `.tile--span-4` - Span 4 columns
- `.tile--span-full` - Span all columns
- `.tile--row-span-2` - Span 2 rows (for masonry layouts)

### Tile Content Elements
- `.tile__title` - Heading text
- `.tile__text` - Body text
- `.tile__meta` - Metadata/info text
- `.tile__image` - Image element
- `.tile__actions` - Container for buttons/actions

### Responsive Behavior
- Fixed column grids automatically reduce columns on smaller screens
- Auto-fit grids adjust tile width based on available space
- On mobile (≤576px), all grids collapse to single column
- Span modifiers adjust automatically for mobile

### Example: Complete Tile
```html
<a href="#" class="tile tile--shadow">
    <div class="tile__header">
        <h3 class="tile__title">Project Name</h3>
    </div>
    <div class="tile__body">
        <img src="image.jpg" alt="" class="tile__image tile__image--cover">
        <p class="tile__text">Project description here.</p>
        <span class="tile__meta">Category • 2024</span>
    </div>
    <div class="tile__footer">
        <div class="tile__actions">
            <button class="btn btn--primary btn--sm">View</button>
        </div>
    </div>
</a>
```

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

