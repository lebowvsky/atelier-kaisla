/**
 * Script to fix double slash issue in Nuxt 4.3.0 generated files
 * This is a workaround for a known bug where .nuxt//dist/ is generated instead of .nuxt/dist/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.resolve(__dirname, '.nuxt/dev/index.mjs');

function fixDoubleSlash() {
  if (!fs.existsSync(indexPath)) {
    console.log('[fix-double-slash] File not found:', indexPath);
    return false;
  }

  try {
    let content = fs.readFileSync(indexPath, 'utf-8');
    const originalContent = content;

    // Fix the double slash
    content = content.replace(/\.nuxt\/\/dist\//g, '.nuxt/dist/');

    if (content !== originalContent) {
      fs.writeFileSync(indexPath, content);
      console.log('[fix-double-slash] ✓ Fixed double slash in .nuxt/dev/index.mjs');
      return true;
    } else {
      console.log('[fix-double-slash] No double slash found (already fixed)');
      return false;
    }
  } catch (error) {
    console.error('[fix-double-slash] Error:', error);
    return false;
  }
}

// Watch for file changes and fix them
function watchAndFix() {
  const nuxtDir = path.resolve(__dirname, '.nuxt');

  if (!fs.existsSync(nuxtDir)) {
    console.log('[fix-double-slash] Waiting for .nuxt directory...');
    setTimeout(watchAndFix, 1000);
    return;
  }

  const devDir = path.resolve(nuxtDir, 'dev');
  if (!fs.existsSync(devDir)) {
    console.log('[fix-double-slash] Waiting for .nuxt/dev directory...');
    setTimeout(watchAndFix, 1000);
    return;
  }

  if (fs.existsSync(indexPath)) {
    fixDoubleSlash();

    // Watch for changes
    fs.watch(indexPath, (eventType) => {
      if (eventType === 'change') {
        console.log('[fix-double-slash] File changed, applying fix...');
        setTimeout(fixDoubleSlash, 100);
      }
    });

    console.log('[fix-double-slash] 👀 Watching for changes...');
  } else {
    setTimeout(watchAndFix, 1000);
  }
}

// Run immediately and start watching
console.log('[fix-double-slash] Starting fix script for Nuxt double slash bug...');
fixDoubleSlash();
watchAndFix();
