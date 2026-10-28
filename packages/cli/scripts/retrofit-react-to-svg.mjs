#!/usr/bin/env node
/**
 * One-off migration helper: convert hand-curated react components in
 * src/react back to svg files in src/assets, so that the svg becomes the
 * single source of truth (including embedded dark-mode <style> and classes).
 *
 * Usage:
 *   node scripts/retrofit-react-to-svg.mjs <assetsRoot> <name> [name...]
 *
 * After running, `cli assets build` regenerates the components from the
 * retrofitted svgs. Verify with git diff before committing.
 */
import fs from 'node:fs';
import path from 'node:path';

const [assetsRoot, ...names] = process.argv.slice(2);

if (!assetsRoot || names.length === 0) {
  console.error(
    'Usage: node retrofit-react-to-svg.mjs <assetsRoot> <name> [name...]',
  );
  process.exit(1);
}

/** Convert a JSX attribute name to an svg attribute name */
function jsxAttrToSvg(name) {
  if (name === 'className') return 'class';
  // Attributes that are camelCase in svg itself
  const keepCamel = new Set([
    'viewBox',
    'preserveAspectRatio',
    'attributeName',
    'attributeType',
    'repeatCount',
    'repeatDur',
    'baseFrequency',
    'tableValues',
    'targetX',
    'targetY',
    'textLength',
    'lengthAdjust',
  ]);
  if (keepCamel.has(name)) return name;
  const kebab = name.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
  return kebab.replace(/^xml-/, 'xml:').replace(/^xlink-/, 'xlink:');
}

/** Convert a JSX style object body to a css style string */
function styleObjectToCss(body) {
  return body
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [key, value] = pair.split(':').map((part) => part.trim());
      return `${jsxAttrToSvg(key)}:${value.replace(/^["']|["']$/g, '')}`;
    })
    .join(';');
}

function retrofit(tsx) {
  const start = tsx.indexOf('<svg');
  const end = tsx.lastIndexOf('</svg>');
  if (start === -1 || end === -1) {
    throw new Error('Could not find <svg>...</svg> in component');
  }
  let svg = tsx.slice(start, end + '</svg>'.length);

  // Remove react-specific spread/props
  svg = svg.replace(/\{\.\.\.props\}/g, '');
  svg = svg.replace(/ref=\{ref\}/g, '');

  // <style>{`...css...`}</style> -> <style>...css...</style>
  svg = svg.replace(
    /<style>\s*\{`([\s\S]*?)`\}\s*<\/style>/g,
    (_m, css) => `<style>${css}</style>`,
  );

  // style={{ key: "value", ... }} -> style="key:value;..."
  svg = svg.replace(
    /style=\{\{([^}]*)\}\}/g,
    (_m, body) => `style="${styleObjectToCss(body)}"`,
  );

  // Numeric attribute values: attr={2} -> attr="2"
  svg = svg.replace(
    /([a-zA-Z][a-zA-Z0-9]*)=\{(-?\d+(?:\.\d+)?)\}/g,
    (_m, name, value) => `${name}="${value}"`,
  );

  // Attribute names: camelCase -> kebab-case (className -> class)
  svg = svg.replace(/(\s)([a-zA-Z][a-zA-Z0-9]*)=/g, (m, whitespace, name) => {
    const converted = jsxAttrToSvg(name);
    return `${whitespace}${converted}=`;
  });

  // Normalize className quotes
  svg = svg.replace(/class='([^']*)'/g, 'class="$1"');

  // Tidy empty lines from removed props
  svg = svg.replace(/\n\s*\n\s*/g, '\n');

  return `${svg}\n`;
}

for (const name of names) {
  const tsxPath = path.join(assetsRoot, 'src', 'react', `${name}.tsx`);
  const svgPath = path.join(assetsRoot, 'src', 'assets', `${name}.svg`);
  if (!fs.existsSync(tsxPath)) {
    console.error(`! ${name}: no component at ${tsxPath}`);
    continue;
  }
  const svg = retrofit(fs.readFileSync(tsxPath, 'utf8'));
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ ${name}: retrofitted component -> ${svgPath}`);
}
