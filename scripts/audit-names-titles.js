import fs from 'fs';

const files = ['index.html', 'README.md', 'src/data/content.js'];
let violations = 0;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Strip emails, urls, handles, filenames
    const stripped = line
      .replace(/https?:\/\/[^\s"'<>]+/g, '')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
      .replace(/assets\/[a-zA-Z0-9._-]+/g, '')
      .replace(/dev-mubassir/g, '')
      .replace(/mubassir[-.]shah_?/g, '')
      .replace(/mubassirrr2005/g, '')
      .replace(/mubassir-cutout/g, '')
      .replace(/mubassir-new/g, '');

    // Check for lowercase "mubassir"
    const match = stripped.match(/\bmubassir\b/);
    if (match) {
      console.warn(`[Lowercase Name Violation] ${f}:${i + 1}: ${line.trim()}`);
      violations++;
    }

    // Check for "AI Product Builder"
    if (/AI\s+Product\s+Builder/i.test(line)) {
      console.warn(`[Old Title Violation] ${f}:${i + 1}: ${line.trim()}`);
      violations++;
    }
  });
}

console.log(`Audit finished with ${violations} violations.`);
if (violations === 0) {
  console.log('PERFECT NAME AND TITLE AUDIT PASSED!');
} else {
  process.exit(1);
}
