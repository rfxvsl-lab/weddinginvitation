const fs = require('fs');
let content = fs.readFileSync('src/components/InvitationPreview.tsx', 'utf8');
content = content.split('rsvps={rsvps}\\n        embedded={embedded}').join('rsvps={rsvps}\n        embedded={embedded}');
fs.writeFileSync('src/components/InvitationPreview.tsx', content);
