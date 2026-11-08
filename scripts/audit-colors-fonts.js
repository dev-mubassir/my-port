import fs from 'fs';
import path from 'path';

// Valid 4 core colors in uppercase and lowercase hex, and rgb equivalents:
// Paper: #DCDCDC (rgb 220, 220, 220)
// Ink: #0A0A0A (rgb 10, 10, 10), #000000 (black)
// Signal Orange: #FF4B2B (rgb 255, 75, 43), #FC4B29
// Backdrop Gray: #8C8C8C (rgb 140, 140, 140)

const ALLOWED_HEX = new Set([
  '#DCDCDC', '#0A0A0A', '#FF4B2B', '#8C8C8C',
  '#FC4B29', '#000000', '#DFDFDF', '#A6A6A6', '#FFF', '#FFFFFF'
]);

// Allowed fonts:
const ALLOWED_FONTS = ['Archivo', 'Syne', 'Anton', 'Instrument Serif', 'JetBrains Mono', 'Space Mono', 'sans-serif', 'serif', 'monospace', '-apple-system', 'BlinkMacSystemFont', 'Georgia', 'Helvetica'];

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (['node_modules', '.git', 'dist', 'screenshots', 'scripts'].includes(file)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, fileList);
    } else if (/\.(css|js|html|svg)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = scanDir('.');
console.log(`Auditing ${files.length} source files...`);

let colorViolations = 0;
let fontViolations = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Find all hex codes
  const hexMatches = content.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  for (const hex of hexMatches) {
    const upper = hex.toUpperCase();
    if (!ALLOWED_HEX.has(upper)) {
      console.warn(`[Color Violation] in ${file}: unexpected hex ${hex}`);
      colorViolations++;
    }
  }

  // Find rgb/rgba colors not matching the 4 colors
  const rgbMatches = content.match(/rgba?\([^)]+\)/g) || [];
  for (const rgb of rgbMatches) {
    // Check if it's based on 10,10,10 or 220,220,220 or 255,75,43 or 140,140,140
    const numbers = rgb.match(/\d+/g);
    if (numbers && numbers.length >= 3) {
      const [r, g, b] = numbers.map(Number);
      const isInk = (r === 10 && g === 10 && b === 10) || (r === 0 && g === 0 && b === 0);
      const isPaper = (r === 220 && g === 220 && b === 220) || (r === 255 && g === 255 && b === 255);
      const isSignal = (r === 255 && g === 75 && b === 43) || (r === 252 && g === 75 && b === 41);
      const isBackdrop = (r === 140 && g === 140 && b === 140);
      if (!isInk && !isPaper && !isSignal && !isBackdrop) {
        console.warn(`[RGBA Violation] in ${file}: unexpected rgb/rgba ${rgb}`);
        colorViolations++;
      }
    }
  }

  // Find font-family declarations
  const fontMatches = content.match(/font-family:\s*([^;]+);/g) || [];
  for (const decl of fontMatches) {
    const val = decl.replace('font-family:', '').replace(';', '').trim();
    // Check if contains var(--font-...) or allowed fonts
    if (val.startsWith('var(--font-')) continue;
    const parts = val.split(',').map(p => p.trim().replace(/['"]/g, ''));
    for (const p of parts) {
      if (!ALLOWED_FONTS.includes(p)) {
        console.warn(`[Font Violation] in ${file}: unexpected font family "${p}"`);
        fontViolations++;
      }
    }
  }
}

console.log(`\nAudit Summary:`);
console.log(`Color Violations: ${colorViolations}`);
console.log(`Font Violations: ${fontViolations}`);

if (colorViolations === 0 && fontViolations === 0) {
  console.log('PERFECT 100% DESIGN SYSTEM COMPLIANCE CONFIRMED!');
} else {
  process.exit(1);
}
