import esbuild from 'esbuild';
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
