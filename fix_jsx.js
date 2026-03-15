const fs = require('fs');
const path = require('path');

function walk(d) {
    let r = [];
    fs.readdirSync(d).forEach(f => {
        let fullPath = path.join(d, f);
        if (fs.statSync(fullPath).isDirectory()) {
            r = r.concat(walk(fullPath));
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            r.push(fullPath);
        }
    });
    return r;
}

walk('src').forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;
    
    // Fix invalid <Image src="..." ... / layout="Responsive" ... />
    if (c.includes('/ layout="responsive"')) {
        c = c.replace(/\/\s*layout="responsive"/g, 'layout="responsive"');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(f, c, 'utf8');
    }
});

console.log('JSX fixes done.');
