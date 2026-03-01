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
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}
const files = walk('src/features/pom-components');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content.replace(/(['"`])\/api\/(?!playwright-pom\/)/g, "$1/api/playwright-pom/");
    newContent = newContent.replace(/http:\/\/localhost:8000\/api\//g, "/api/playwright-pom/");
    fs.writeFileSync(f, newContent);
});
console.log('Done mapping API paths');
