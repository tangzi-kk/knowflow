import esbuild from 'esbuild';
import { access } from 'node:fs/promises';
import process from 'node:process';

const isWatch = process.argv.includes('--watch');

/** OB 插件 esbuild 配置。参考现有 auto-rename-plugin 的构建模式。 */
const buildOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    // @sync/shared 会被 bundle 进去（不是 external，因为是 workspace 依赖）
  ],
  format: 'cjs',
  target: 'es2020',
  platform: 'node',
  outfile: 'main.js',
  sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
  minify: process.env.NODE_ENV === 'production',
  logLevel: 'info',
};

async function main() {
  // Obsidian 从插件根目录加载 styles.css。缺失时构建必须失败，
  // 避免只发布 main.js/manifest.json 而静默丢失统一设置界面样式。
  await access(new URL('./styles.css', import.meta.url));

  if (isWatch) {
    // esbuild 0.17+ 用 context() 替代 build({watch})
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('👀 watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('✅ ob-plugin build done');
  }
}

main().catch((err) => {
  console.error('❌ esbuild failed:', err);
  process.exit(1);
});
