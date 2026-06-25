const fs = require('fs');
const path = require('path');

function replaceFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(new RegExp(search, 'g'), replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

// GUEST MANAGER
replaceFile(path.resolve('src/components/GuestManager.tsx'), [
    ['bg-indigo-600', 'bg-primary'],
    ['hover:bg-indigo-700', 'hover:bg-primary/90'],
    ['bg-indigo-50', 'bg-surface-container-low'],
    ['border-indigo-100', 'border-outline-variant'],
    ['border-indigo-200', 'border-outline-variant'],
    ['text-indigo-650', 'text-primary'],
    ['bg-emerald-50', 'bg-surface-container-low'],
    ['hover:bg-emerald-100', 'hover:bg-surface-container'],
    ['text-emerald-700', 'text-primary'],
    ['border-emerald-200', 'border-outline-variant'],
    ['bg-slate-100', 'bg-surface-container-low'],
    ['hover:bg-slate-200', 'hover:bg-surface-container'],
    ['border-slate-205', 'border-outline-variant'],
    ['bg-surface-container-low/50', 'bg-surface-container-low'],
    ['border-slate-150', 'border-outline-variant'],
    ['border-slate-55/65', 'border-outline-variant'],
    ['border-slate-250', 'border-outline-variant'],
    ['bg-slate-200', 'bg-surface-container-low'],
    ['text-emerald-750', 'text-emerald-800'],
    ['text-amber-700', 'text-amber-800'],
    ['bg-rose-50', 'bg-error-container'],
    ['hover:bg-rose-100', 'hover:bg-error-container'],
    ['hover:text-rose-700', 'hover:text-error'],
    ['bg-emerald-950/30', 'bg-surface-container-low'],
    ['border-emerald-900/40', 'border-outline-variant'],
    ['text-emerald-400', 'text-on-surface'],
    ['bg-red-650', 'bg-primary'],
    ['bg-red-500', 'bg-primary'],
    ['text-red-500', 'text-primary'],
    ['text-red-600', 'text-primary'],
    ['border-red-500', 'border-primary'],
    ['border-red-900\/30', 'border-outline-variant'],
    ['bg-red-950\/20', 'bg-surface-container-low'],
    ['text-red-550', 'text-primary'],
    ['bg-red-600', 'bg-primary'],
    ['hover:bg-red-700', 'hover:bg-primary/90'],
    ['text-on-surface text-xs font-bold transition shadow-sm bg-indigo-600 hover:bg-indigo-700 text-on-surface', 'text-primary-foreground text-xs font-bold transition shadow-sm bg-primary hover:bg-primary/90'],
    ['bg-indigo-600 hover:bg-indigo-700 text-on-surface', 'bg-primary hover:bg-primary/90 text-primary-foreground']
]);

// ANALYTICS
replaceFile(path.resolve('src/components/AnalyticsDashboard.tsx'), [
    ['bg-indigo-50', 'bg-surface-container-low'],
    ['text-indigo-600', 'text-primary'],
    ['bg-indigo-600', 'bg-primary'],
    ['hover:bg-indigo-700', 'hover:bg-primary/90'],
    ['bg-indigo-950', 'bg-surface-container-low'],
    ['border-indigo-900\/30', 'border-outline-variant'],
    ['bg-pink-50', 'bg-surface-container-low'],
    ['text-pink-600', 'text-primary'],
    ['bg-amber-50', 'bg-surface-container-low'],
    ['text-amber-600', 'text-primary'],
    ['stroke="#4F46E5"', 'stroke="var(--primary)"'],
    ['fill="url\\(#blue-gradient\\)"', 'fill="url(#primary-gradient)"'],
    ['<stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8"/>', '<stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8"/>'],
    ['<stop offset="100%" stopColor="#4F46E5" stopOpacity="0"/>', '<stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>'],
    ['id="blue-gradient"', 'id="primary-gradient"'],
    ['border-slate-200', 'border-outline-variant'],
    ['border-slate-100', 'border-outline-variant'],
    ['bg-slate-50', 'bg-surface-container-lowest'],
    ['bg-slate-100', 'bg-surface-container-low']
]);

console.log('GuestManager and AnalyticsDashboard colors replaced.');
