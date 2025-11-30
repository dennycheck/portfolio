# Portfolio Site

## Running Locally

Due to browser CORS restrictions, you need to run a local web server to view this site (you can't just open the HTML files directly).

### Quick Start

1. Open Terminal in this directory
2. Run one of these commands:

**Python 3:**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (if you have it):**
```bash
npx http-server -p 8000
```

3. Open your browser and go to: `http://localhost:8000`

### Why?

The icon loader uses `fetch()` to load SVG files, which requires HTTP/HTTPS protocol. Opening files directly with `file://` protocol causes CORS errors.

## Development

- `styles.css` - Main stylesheet
- `icon-loader.js` - Loads Heroicons SVG files
- `themes/` - Theme files (dark mode, etc.)
- `components.html` - Component gallery/reference
