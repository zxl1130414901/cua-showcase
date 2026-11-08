#!/usr/bin/env node
/**
 * 把 Vite 产物压成单文件 dist/index.html：
 * - CSS / JS 全部内联
 * - 去掉 type="module"、crossorigin
 * - 删除残余 assets
 * - 校验不存在外部脚本 / 样式 / import.meta
 * 日志统一中文并打印耗时。
 */
import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const HTML = join(DIST, 'index.html');
const started = Date.now();

if (!existsSync(HTML)) {
  console.error('[单文件打包] 未找到 dist/index.html，请先执行 vite build');
  process.exit(1);
}

let html = readFileSync(HTML, 'utf8');
const htmlBefore = Buffer.byteLength(html);

const cssFiles = [];
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, (tag) => {
  const href = tag.match(/href="([^"]+)"/)?.[1];
  if (!href) return tag;
  const path = join(DIST, href.replace(/^\.?\//, ''));
  if (!existsSync(path)) return tag;
  cssFiles.push(href);
  const css = readFileSync(path, 'utf8');
  return `<style>\n${css}\n</style>`;
});

const jsFiles = [];
const inlineScripts = [];
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (tag, src) => {
  const path = join(DIST, src.replace(/^\.?\//, ''));
  if (!existsSync(path)) return tag;
  jsFiles.push(src);
  const js = readFileSync(path, 'utf8').replace(/<\/script/gi, '<\\/script');
  inlineScripts.push(`<script>\n${js}\n</script>`);
  return '';
});

// 内联脚本必须放在 body 末尾：去掉 type="module" 后不再延迟执行，
// 若留在 head 会在 #root 出现前运行。
html = html.replace('</body>', `${inlineScripts.join('\n')}\n</body>`);

// 去掉标签上残留的 module / crossorigin 标记（只处理标签本身，避免误伤内联脚本内容）
const stripAttrs = (tag) =>
  tag.replace(/\s+type="module"/gi, '').replace(/\s+crossorigin(="[^"]*")?/gi, '');
html = html
  .replace(/<script\b[^>]*>/gi, stripAttrs)
  .replace(/<link\b[^>]*>/gi, stripAttrs);

const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
const hasModule = scriptTags.some((tag) => /type="module"/i.test(tag));
const hasCrossOrigin = [...scriptTags, ...linkTags].some((tag) => /crossorigin/i.test(tag));
const hasExternalScript = scriptTags.some((tag) => /\bsrc=/i.test(tag));
const hasStylesheet = linkTags.some((tag) => /stylesheet/i.test(tag));
const hasImportMeta = /import\.meta/.test(html);

const problems = [
  hasModule ? 'type="module"' : '',
  hasCrossOrigin ? 'crossorigin' : '',
  hasImportMeta ? 'import.meta' : '',
  hasExternalScript ? '外部 script src' : '',
  hasStylesheet ? '外部样式表' : '',
].filter(Boolean);
if (problems.length > 0) {
  console.error(`[单文件打包] 校验失败：仍存在 ${problems.join('、')}`);
  process.exit(1);
}

if (!html.includes('<style>') || !html.includes('<script>')) {
  console.error('[单文件打包] 未内联 CSS 或 JS，请检查 Vite 产物结构');
  process.exit(1);
}

writeFileSync(HTML, html, 'utf8');

// 清理中间产物，dist 只留 index.html
if (cssFiles.length + jsFiles.length > 0) {
  for (const file of [...cssFiles, ...jsFiles]) {
    const path = join(DIST, file.replace(/^\.?\//, ''));
    if (existsSync(path)) rmSync(path, { force: true });
  }
}
const assets = join(DIST, 'assets');
if (existsSync(assets)) rmSync(assets, { recursive: true, force: true });
for (const entry of readdirSync(DIST)) {
  if (entry === 'index.html') continue;
  const path = join(DIST, entry);
  if (statSync(path).isDirectory() && entry === 'assets') rmSync(path, { recursive: true, force: true });
}

const after = statSync(HTML).size;
console.log(
  `[单文件打包] 完成：内联 CSS ${cssFiles.length} 个、JS ${jsFiles.length} 个，` +
    `${(htmlBefore / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB；` +
    `已清除外部依赖标记（${Date.now() - started} ms）`,
);
