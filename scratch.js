const fs = require('fs');
const files = [
  'app/dojos/dojos.css',
  'app/senseis/senseis.css',
  'app/about/about.css',
  'app/grading/grading.css',
  'app/events/events.css',
  'app/summer-camp/summer-camp.css'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // Replace solid light backgrounds with var(--bg-primary) or transparent
  content = content.replace(/background(-color)?:\s*(#ffffff|#fff|white|#f[a-f0-9]{2}|#f[a-f0-9]{5});?/gi, 'background: transparent;');
  content = content.replace(/background(-color)?:\s*(#f4f6f9|#f8f9fa|#f5f5f5);?/gi, 'background: var(--bg-primary);');

  // Replace dark text with var(--text-primary)
  content = content.replace(/color:\s*(#333333|#333|#222|#000|black);?/gi, 'color: var(--text-primary);');
  content = content.replace(/color:\s*(#666666|#666|#555|#777);?/gi, 'color: var(--text-muted);');

  // Apply glass card properties to obvious card components
  // Look for .xyz-card classes and inject glass properties
  content = content.replace(/(\.[a-z0-9_-]*card[a-z0-9_-]*\s*\{[^}]*)\}/gi, (match, p1) => {
    if (p1.includes('var(--bg-card)')) return match; // already done
    return p1.replace(/background:[^;]+;?/gi, '') // remove existing bg
             .replace(/box-shadow:[^;]+;?/gi, '') // remove existing shadow
             .replace(/border:[^;]+;?/gi, '') // remove existing border
      + '\n  background: var(--bg-card);\n  backdrop-filter: var(--card-blur);\n  -webkit-backdrop-filter: var(--card-blur);\n  border: var(--border-glass);\n  border-radius: 16px;\n}';
  });

  // Basic Button replacements:
  content = content.replace(/(\.[a-z0-9_-]*btn[a-z0-9_-]*\s*\{[^}]*)\}/gi, (match, p1) => {
    if (match.includes('btn-outline') || match.includes('transparent')) return match; 
    return p1 + '\n  background: linear-gradient(135deg, var(--accent-crimson), #96281b);\n  color: white;\n  border: none;\n  transition: transform 0.2s, box-shadow 0.2s;\n}';
  });
  
  // Font family inheritance
  content = content.replace(/font-family:\s*[^;]+;?/gi, '');

  fs.writeFileSync(f, content);
  console.log('Processed', f);
});
