import fs from 'node:fs';
import assert from 'node:assert/strict';
const site = new URL('../site/', import.meta.url);
const pages = ['index.html','city-hermitage/index.html','hearth/index.html','season-garden/index.html'];
for (const page of pages) {
  const html = fs.readFileSync(new URL(page,site),'utf8');
  assert.match(html, /<html\s+lang="zh-CN"/i, `${page}: language`);
  assert.match(html, /<meta\s+charset="utf-8"/i, `${page}: charset`);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i, `${page}: remote JS`);
  assert.doesNotMatch(html, /<iframe\b/i, `${page}: iframe`);
  assert.doesNotMatch(html, /(?:fetch|sendBeacon)\s*\(\s*["']https?:/i, `${page}: network request`);
  assert.doesNotMatch(html, /<form[^>]+action=["']https?:/i, `${page}: external form`);
  console.log('PASS security baseline:',page);
}
const seasons=JSON.parse(fs.readFileSync(new URL('season-garden/seasons.json',site),'utf8'));
assert.equal(seasons.length,24);
assert.equal(new Set(seasons.map(s=>s.id)).size,24);
assert.ok(seasons.every(s=>s.name&&s.action&&s.month>=1&&s.month<=12&&s.day>=1&&s.day<=31));
const lines=JSON.parse(fs.readFileSync(new URL('season-garden/seed-lines.json',site),'utf8'));
assert.ok(lines.length>=300);
assert.ok(fs.existsSync(new URL('.nojekyll',site)));
assert.ok(fs.existsSync(new URL('404.html',site)));
console.log('PASS data integrity, Pages assets');
