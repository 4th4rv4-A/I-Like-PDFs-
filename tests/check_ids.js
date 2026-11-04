const fs = require('fs');

const appJs = fs.readFileSync('public/app.js', 'utf8');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Check onclick, onchange, oninput in indexHtml
const handlerRegex = /on(?:click|change|input)\s*=\s*["']([a-zA-Z0-9_]+)\s*\(/g;
const handlers = new Set();
let m;
while ((m = handlerRegex.exec(indexHtml)) !== null) {
    handlers.add(m[1]);
}

// Also check handlers in dynamic HTML templates in app.js
while ((m = handlerRegex.exec(appJs)) !== null) {
    handlers.add(m[1]);
}

const missingFns = [];
for (const fn of handlers) {
    // Check if function <fn> or const <fn> = or <fn> = is in appJs
    const fnDefRegex = new RegExp(`(?:function\\s+${fn}\\b|(?:const|let|var)?\\s*${fn}\\s*=)`);
    if (!fnDefRegex.test(appJs)) {
        missingFns.push(fn);
    }
}

console.log('Total event handlers checked:', handlers.size);
console.log('Missing functions in app.js:', missingFns);
