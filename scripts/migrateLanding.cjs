const fs = require('fs');

const content = fs.readFileSync('design.md', 'utf8');
const parts = content.split('<!-- Undangan Kita - Landing Page with Satoshi Font -->');
if (parts.length < 2) process.exit(1);

const landingHtml = parts[1];
const bodyParts = landingHtml.split('<body');
if (bodyParts.length < 2) process.exit(1);

let bodyHtml = bodyParts[1].substring(bodyParts[1].indexOf('>') + 1).split('</body>')[0];

bodyHtml = bodyHtml
  .replace(/class=/g, 'className=')
  .replace(/viewbox=/g, 'viewBox=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/<img([^>]+)>/g, (match) => match.endsWith('/>') ? match : match.replace(/>$/, ' />'))
  .replace(/<input([^>]+)>/g, (match) => match.endsWith('/>') ? match : match.replace(/>$/, ' />'))
  .replace(/<br>/g, '<br />')
  .replace(/style="([^"]+)"/g, (match, styleStr) => {
    return 'style={{' + styleStr.split(';').filter(s => s.trim()).map(s => {
      const [k, v] = s.split(':');
      if (!k || !v) return '';
      const camelK = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      return camelK + ': "' + v.trim().replace(/"/g, '\\"') + '"';
    }).filter(Boolean).join(', ') + '}}';
  });

bodyHtml = bodyHtml.replace(/<script>[\s\S]*?<\/script>/gi, '');

const tsxContent = `import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-background-main font-sans text-on-surface antialiased overflow-x-hidden">
      ${bodyHtml}
    </div>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', tsxContent);
console.log('Conversion complete!');
