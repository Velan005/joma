const fs = require('fs');
let c = fs.readFileSync('src/components/ui/chart.tsx', 'utf8');

c = c.replace(/\\(\\s*\\{\\s*active,\\s*payload,/gs, '(props: any, ref) => { const { active, payload,');
if (c.includes('props: any, ref) => { const { active, payload,')) {
    console.log('Successfully modified active/payload params.');
}

fs.writeFileSync('src/components/ui/chart.tsx', c, 'utf8');
