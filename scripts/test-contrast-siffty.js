import { chromium } from 'playwright';

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1
  };
}

function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

function contrastRatio(lum1, lum2) {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Blend foreground over background if alpha < 1
function blend(fg, bg) {
  const alpha = fg.a;
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 1
  };
}

async function testContrast() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  const results = await page.evaluate(() => {
    const section = document.querySelector('#siffty');
    if (!section) return { error: 'Section #siffty not found' };

    // Select text nodes or elements inside #siffty
    const selectors = [
      '.section-index',
      '.section-label',
      '.siffty-badge',
      '.siffty-headline',
      '.siffty-intro-lead',
      '.siffty-actions .btn-primary',
      '.siffty-actions .btn-secondary',
      '.diagram-intro-text',
      '.btn-simulate-failure',
      '.arch-col-title',
      '.arch-text-title',
      '.arch-text-sub',
      '.popover-node-title',
      '.popover-node-desc',
      '.diagram-caption',
      '.metric-num',
      '.metric-label',
      '.metric-sub'
    ];

    const data = [];
    const sectionBg = window.getComputedStyle(section).backgroundColor;

    selectors.forEach(sel => {
      const el = section.querySelector(sel);
      if (el) {
        const style = window.getComputedStyle(el);
        const color = style.color || style.fill;
        let bg = style.backgroundColor;
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
          // Find closest ancestor with background
          let parent = el.parentElement;
          while (parent && (window.getComputedStyle(parent).backgroundColor === 'rgba(0, 0, 0, 0)' || window.getComputedStyle(parent).backgroundColor === 'transparent')) {
            parent = parent.parentElement;
          }
          bg = parent ? window.getComputedStyle(parent).backgroundColor : sectionBg;
        }
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        data.push({
          selector: sel,
          color,
          bg,
          fontSize,
          fontWeight,
          isLargeText: fontSize >= 24 || (fontSize >= 18.5 && (fontWeight === 'bold' || parseInt(fontWeight, 10) >= 700))
        });
      }
    });

    return data;
  });

  console.log('Contrast check for #siffty:');
  let failures = 0;
  for (const item of results) {
    const fg = parseRgb(item.color);
    const bgRaw = parseRgb(item.bg);
    const effectiveFg = blend(fg, bgRaw);
    const lum1 = relativeLuminance(effectiveFg.r, effectiveFg.g, effectiveFg.b);
    const lum2 = relativeLuminance(bgRaw.r, bgRaw.g, bgRaw.b);
    const ratio = contrastRatio(lum1, lum2);
    const minRequired = item.isLargeText ? 3.0 : 4.5;
    const pass = ratio >= minRequired;
    if (!pass) failures++;
    console.log(`${pass ? 'PASS' : 'FAIL'} [${ratio.toFixed(2)}:1 >= ${minRequired}:1] ${item.selector} (fg: ${item.color}, bg: ${item.bg}, ${item.isLargeText ? 'large' : 'normal'})`);
  }

  await browser.close();
  if (failures > 0) {
    console.error(`FAILED: ${failures} elements failed WCAG contrast check.`);
    process.exit(1);
  } else {
    console.log('ALL ELEMENTS PASSED WCAG CONTRAST REQUIREMENTS!');
  }
}

testContrast().catch(err => {
  console.error(err);
  process.exit(1);
});
