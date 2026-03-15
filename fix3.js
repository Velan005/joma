const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/const saved = localStorage\.getItem/g, "if (typeof window === 'undefined') return undefined;\n    const saved = localStorage.getItem");
  
  // also handle the defaultProfile for profile
  c = c.replace(/return saved \? JSON\.parse\(saved\) \: \[\];/g, "if (typeof window === 'undefined') return [];\n    return saved ? JSON.parse(saved) : [];");
  
  // Actually, a simpler replace:
  c = c.replace(/useState<Address\[\]>\(\(\) => \{/g, "useState<Address[]>(() => {\n    if (typeof window === 'undefined') return [];");
  c = c.replace(/useState<Profile>\(\(\) => \{/g, "useState<Profile>(() => {\n    if (typeof window === 'undefined') return defaultProfile;");
  fs.writeFileSync(file, c, 'utf8');
}

fix('src/app/(store)/account/page.tsx');
console.log('Done');
