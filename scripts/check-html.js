const { readFileSync } = require('node:fs');
const vm = require('node:vm');

const file = 'prompt_driven_interface_effect_lab_v2_single.html';
const html = readFileSync(file, 'utf8');

for (const token of ['id="themeToggle"', "id:'cursorSpotlight'", "id:'cursorElastic'", 'theme-dark']) {
  if (!html.includes(token)) {
    throw new Error(`Missing expected token: ${token}`);
  }
}

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
if (!scripts.length) throw new Error('No inline script found');
for (const [index, match] of scripts.entries()) {
  new vm.Script(match[1], { filename: `${file}#inline-script-${index + 1}` });
}

console.log(`HTML smoke check passed for ${file}`);
