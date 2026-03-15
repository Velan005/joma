const fs = require('fs');
const path = require('path');

function walk(d) {
    let r = [];
    fs.readdirSync(d).forEach(f => {
        let fullPath = path.join(d, f);
        if (fs.statSync(fullPath).isDirectory()) r = r.concat(walk(fullPath));
        else if (f.endsWith('page.tsx')) r.push(fullPath);
    });
    return r;
}

const pages = walk('src/app/(store)');
pages.forEach(p => {
    let c = fs.readFileSync(p, 'utf8');
    if (!c.includes("'use client'") && !c.includes('"use client"')) {
        fs.writeFileSync(p, "'use client';\n" + c, 'utf8');
    }
});

// Wrap `Shop` in Suspense in `shop/page.tsx` since Next 14 fails CSR build without it
const shopFile = 'src/app/(store)/shop/page.tsx';
let shopContent = fs.readFileSync(shopFile, 'utf8');
if (!shopContent.includes('Suspense fallback')) {
    // If we rename Shop export to ShopInner, then export a Suspense wrapper
    shopContent = shopContent.replace('const Shop = () => {', 
        'import { Suspense } from "react";\n\nconst ShopInner = () => {');
    shopContent = shopContent.replace('export default Shop;', 
        'const Shop = () => <Suspense fallback={<div>Loading...</div>}><ShopInner /></Suspense>;\n\nexport default Shop;');
    fs.writeFileSync(shopFile, shopContent, 'utf8');
}

console.log('Finished updating client components.');
