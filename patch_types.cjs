const fs = require('fs');

let tsconfig = fs.readFileSync('tsconfig.app.json', 'utf-8');
tsconfig = tsconfig.replace(/"verbatimModuleSyntax": true/g, '"verbatimModuleSyntax": false');
fs.writeFileSync('tsconfig.app.json', tsconfig);
