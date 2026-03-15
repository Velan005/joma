const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Remove React Router Dom
    if (content.includes('react-router-dom')) {
        changed = true;
        // Fix Link
        if (content.includes('Link')) {
            content = content.replace(/import\s+{([^}]*)}.*'react-router-dom'/g, (match, p1) => {
                let imports = p1.split(',').map(s => s.trim());
                let nextImports = [];
                let nextNavImports = [];
                
                if (imports.includes('Link')) {
                  nextImports.push("import Link from 'next/link';");
                }
                
                if (imports.includes('useNavigate')) {
                  nextNavImports.push('useRouter');
                  content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\)/g, "const $1 = useRouter()");
                  content = content.replace(/navigate\(/g, "$1.push("); // Will need manual fix if alias is not navigate
                }
                
                if (imports.includes('useParams')) {
                  nextNavImports.push('useParams');
                }
                if (imports.includes('useSearchParams')) {
                  nextNavImports.push('useSearchParams');
                }
                if (imports.includes('useLocation')) {
                  nextNavImports.push('usePathname');
                  content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\)/g, "const $1 = usePathname()");
                }

                let finalString = nextImports.join('\n');
                if (nextNavImports.length > 0) {
                  finalString += `\nimport { ${nextNavImports.join(', ')} } from 'next/navigation';`;
                }
                return finalString;
            });
        } else {
             content = content.replace(/import\s+{([^}]*)}.*'react-router-dom'/g, (match, p1) => {
                let imports = p1.split(',').map(s => s.trim());
                 let nextNavImports = [];
                 if (imports.includes('useNavigate')) nextNavImports.push('useRouter');
                 if (imports.includes('useParams')) nextNavImports.push('useParams');
                 if (imports.includes('useSearchParams')) nextNavImports.push('useSearchParams');
                 if (imports.includes('useLocation')) nextNavImports.push('usePathname');
                 
                 if (nextNavImports.length > 0) {
                     return `import { ${nextNavImports.join(', ')} } from 'next/navigation';`;
                 }
                 return '';
             });
        }
        
        // General cleanup if navigate was standard used
        content = content.replace(/const\s+navigate\s*=\s*useRouter\(\)/g, "const router = useRouter()");
        content = content.replace(/navigate\(/g, "router.push(");
    }
    
    // Convert <img> to <Image>
    if (content.includes('<img') || content.includes('< img')) {
        changed = true;
        if (!content.includes("from 'next/image'") && !content.includes('from "next/image"')) {
            content = "import Image from 'next/image';\n" + content;
        }
        // Regex replace is hard for all <img> tags, but we will do a basic sweep
        content = content.replace(/<img\s([^>]+)>/g, "<Image $1 layout=\"responsive\" width={500} height={500} />"); 
        // This is a naive replace, we might need manual fix later.
    }

    // Adding 'use client'
    if (file.includes('pages\\') || file.includes('pages/') || file.includes('components\\') || file.includes('components/') || file.includes('\\app\\') || file.includes('/app/')) {
        if (content.includes('useState') || content.includes('useEffect') || content.includes('useContext') || content.includes('useRouter') || content.includes('useSearchParams') || content.includes('usePathname') || content.includes('useParams') || content.includes('onClick')) {
            if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
                content = "'use client';\n" + content;
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log('Migration basic script done.');
