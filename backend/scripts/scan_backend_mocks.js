const fs = require('fs');
const path = require('path');

function searchBackend(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'scripts') {
        searchBackend(full);
      }
    } else if (entry.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (/\b(mock|dummy|fake|sample|test@|bypass|hardcode)\b/i.test(l)) {
          // Exclude comments or standard variable names if harmless
          console.log(`${path.relative('c:/Users/hp/OneDrive/Desktop/misc/backend', full)}:${idx+1}: ${l.trim().slice(0, 100)}`);
        }
      });
    }
  }
}

console.log('--- SCANNING BACKEND SRC ---');
searchBackend('c:/Users/hp/OneDrive/Desktop/misc/backend/src');
