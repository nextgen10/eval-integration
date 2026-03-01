const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}
const files = walk('src/features/pom-components').concat(walk('src/contexts'));
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.startsWith('"use client";') && !content.startsWith("'use client';")) {
        content = '"use client";\n' + content;
    }
    content = content.replace(/from\s+['"](?:\.\.\/)+contexts\/(.*?)['"]/g, "from '@/contexts/$1'");
    content = content.replace(/from\s+['"]\.\/contexts\/(.*?)['"]/g, "from '@/contexts/$1'");
    fs.writeFileSync(f, content);
});
console.log("Files updated successfully");
