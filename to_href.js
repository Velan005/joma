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
    
    // Fix `to="..."` to `href="..."`
    if (c.includes('to="') || c.includes("to={") || c.includes("to='")) {
        // Find Link/NavLink tags and target 'to=' inside them.
        let newC = c.replace(/<([Nn]av)?Link\s+(.*?)to=/g, "<$1Link $2href=");
        if (newC !== c) {
            c = newC;
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(f, c, 'utf8');
    }
});

console.log('Fix to href script done.');
