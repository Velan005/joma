const fs = require('fs');
let c = fs.readFileSync('src/components/ui/chart.tsx', 'utf8');

c = c.replace(/payload\.map\(\(item,\s*index\)/g, 'payload.map((item: any, index: number)');

fs.writeFileSync('src/components/ui/chart.tsx', c, 'utf8');
console.log('Fixed implicit any error');
