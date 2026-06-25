const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/components/EditorPanel.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replacements
content = content.replace(/bg-tertiary-container/g, 'bg-surface-container-low');
content = content.replace(/bg-secondary-container/g, 'bg-surface-container-low');
content = content.replace(/bg-primary-container/g, 'bg-surface-container-low');

content = content.replace(/bg-indigo-600/g, 'bg-primary');
content = content.replace(/hover:bg-indigo-700/g, 'hover:bg-primary/90');
content = content.replace(/bg-indigo-100/g, 'bg-surface-container-low');
content = content.replace(/hover:bg-indigo-100/g, 'hover:bg-surface-container');
content = content.replace(/border-indigo-150/g, 'border-outline-variant');

content = content.replace(/text-tertiary/g, 'text-primary');
content = content.replace(/text-secondary/g, 'text-primary');
content = content.replace(/text-amber-500/g, 'text-primary');

content = content.replace(/border-amber-100\/50/g, 'border-outline-variant');
content = content.replace(/border-rose-100\/50/g, 'border-outline-variant');
content = content.replace(/border-pink-100\/50/g, 'border-outline-variant');
content = content.replace(/border-amber-100/g, 'border-outline-variant');
content = content.replace(/border-tertiary\/20/g, 'border-outline-variant');
content = content.replace(/border-secondary\/20/g, 'border-outline-variant');
content = content.replace(/border-primary\/20/g, 'border-outline-variant');

content = content.replace(/ring-pink-500/g, 'ring-primary');
content = content.replace(/focus:ring-pink-500/g, 'focus:ring-primary');

content = content.replace(/text-primary text-on-surface/g, 'text-primary text-primary-foreground');
content = content.replace(/text-on-surface text-\[10px\]/g, 'text-primary text-[10px]');
content = content.replace(/bg-primary\/20 text-primary/g, 'bg-primary text-primary-foreground');
content = content.replace(/bg-tertiary\/20/g, 'bg-surface-container');

// Tabs top gradients
content = content.replace(/bg-gradient-to-br from-primary to-primary-fixed/g, 'bg-primary');
content = content.replace(/bg-gradient-to-br from-secondary to-secondary-fixed/g, 'bg-primary');
content = content.replace(/bg-gradient-to-br from-tertiary to-tertiary-fixed/g, 'bg-primary');
content = content.replace(/bg-gradient-to-br from-error to-error-container/g, 'bg-primary');

// Drop shadow colors
content = content.replace(/shadow-\[0_0_10px_rgba\(244,63,94,0\.3\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[0_0_10px_rgba\(59,130,246,0\.3\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[0_0_10px_rgba\(16,185,129,0\.3\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[0_0_10px_rgba\(168,85,247,0\.3\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[0_0_10px_rgba\(245,158,11,0\.3\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[0_0_10px_rgba\(6,182,212,0\.3\)\]/g, 'shadow-sm');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Colors replaced successfully!');
