const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Layout.tsx'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
    
    // Add embedded to interface if not exists
    if (!content.includes('embedded?: boolean;')) {
        content = content.replace(/rsvps: RSVP\[\];/g, 'rsvps: RSVP[];\n    embedded?: boolean;');
    }
    
    // Add embedded to destructured props
    const fnRegex = /(export default function [A-Za-z]+Layout\s*\(\{\s*data,\s*theme,\s*guest,\s*onAddRSVP,\s*rsvps)(\s*\}\s*:\s*[A-Za-z]+Props\s*\)\s*\{)/g;
    const arrowRegex = /(const [A-Za-z]+Layout\s*=\s*\(\{\s*data,\s*theme,\s*guest,\s*onAddRSVP,\s*rsvps)(\s*\}\s*:\s*[A-Za-z]+Props\s*\)\s*=>\s*\{)/g;
    const generalRegex = /({ data, theme, guest, onAddRSVP, rsvps })/g;
    
    if (content.match(fnRegex)) {
        content = content.replace(fnRegex, '$1, embedded = false$2');
    } else if (content.match(arrowRegex)) {
        content = content.replace(arrowRegex, '$1, embedded = false$2');
    } else if (content.includes('{ data, theme, guest, onAddRSVP, rsvps }')) {
        content = content.replace('{ data, theme, guest, onAddRSVP, rsvps }', '{ data, theme, guest, onAddRSVP, rsvps, embedded = false }');
    } else {
        console.log(`Could not find prop destructuring in ${file}`);
    }

    // Now set the initial state for the opening cover
    if (file === 'DarkLuxuryLayout.tsx') {
        content = content.replace(/const \[isOpen, setIsOpen\] = useState\(false\);/, 'const [isOpen, setIsOpen] = useState(embedded ? true : false);');
    } else if (file === 'GrandBallroomLayout.tsx') {
        content = content.replace(/const \[stage, setStage\] = useState<'curtain' \| 'content'>\('curtain'\);/, "const [stage, setStage] = useState<'curtain' | 'content'>(embedded ? 'content' : 'curtain');");
    } else if (file === 'LuxuryPinkLayout.tsx') {
        content = content.replace(/const \[isOpened, setIsOpened\] = useState\(false\);/, 'const [isOpened, setIsOpened] = useState(embedded ? true : false);');
    } else if (file === 'NetflixLuxuryLayout.tsx') {
        content = content.replace(/const \[stage, setStage\] = useState<'envelope' \| 'hero' \| 'content'>\('envelope'\);/, "const [stage, setStage] = useState<'envelope' | 'hero' | 'content'>(embedded ? 'content' : 'envelope');");
    } else if (file === 'RoyalArabianLayout.tsx') {
        content = content.replace(/const \[stage, setStage\] = useState<'envelope' \| 'hero' \| 'content'>\('envelope'\);/, "const [stage, setStage] = useState<'envelope' | 'hero' | 'content'>(embedded ? 'content' : 'envelope');");
    } else if (file === 'SpotiLoveLayout.tsx') {
        content = content.replace(/const \[showOpening, setShowOpening\] = useState\(true\);/, 'const [showOpening, setShowOpening] = useState(embedded ? false : true);');
    }

    fs.writeFileSync(path.join(templatesDir, file), content, 'utf8');
    console.log(`Patched ${file}`);
});
