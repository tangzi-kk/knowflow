import esbuild from 'esbuild';
import process from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const isWatch = process.argv.includes('--watch');
const outDir = 'dist';

// 清理 dist
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

const sharedConfig = {
  bundle: true,
  format: 'iife',
  target: 'chrome110',
  sourcemap: 'linked',
  logLevel: 'info',
};

/** 扩展入口：content / background / popup / sidepanel / settings。 */
const entries = [
  { entry: 'src/content/content.ts', out: 'content.js' },
  { entry: 'src/background.ts', out: 'background.js' },
  { entry: 'src/popup/popup.ts', out: 'popup.js' },
  { entry: 'src/sidepanel/sidepanel.ts', out: 'sidepanel.js' },
  { entry: 'src/settings/settings.ts', out: 'settings.js' },
  { entry: 'src/content/toolbar.ts', out: 'toolbar.js' },
  { entry: 'src/content/ds-token.ts', out: 'ds-token.js' },
  { entry: 'src/content/ds-token-main.ts', out: 'ds-token-main.js' },
];

async function main() {
  // 复制静态资源
  const staticFiles = [
    'tokens.css',
    'manifest.json',
    'popup.html',
    'popup.css',
    'sidepanel.html',
    'sidepanel.css',
    'settings.html',
    'settings.css',
    'content.css',
    'toolbar.css',
  ];
  for (const f of staticFiles) {
    if (fs.existsSync(f)) {
      fs.copyFileSync(f, path.join(outDir, f));
    }
  }
  // 复制图标目录
  if (fs.existsSync('icons')) {
    fs.cpSync('icons', path.join(outDir, 'icons'), { recursive: true });
  }

  for (const { entry, out } of entries) {
    const options = {
      ...sharedConfig,
      entryPoints: [entry],
      outfile: path.join(outDir, out),
    };
    if (isWatch) {
      const ctx = await esbuild.context(options);
      await ctx.watch();
      console.log(`👀 watching ${out}...`);
    } else {
      await esbuild.build(options);
    }
  }
  console.log('✅ extension build done');
}

main().catch((err) => {
  console.error('❌ extension build failed:', err);
  process.exit(1);
});
