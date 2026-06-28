/**
 * MVP 可用性自检脚本 —— 临时产物，测完即删。
 * 验证 resolveCli 自动探测逻辑在「路径不固定」多设备场景下的稳健性。
 */
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as os from 'node:os';

const MIN_VERSION = [1, 0, 52];

function which(cmd) {
  try {
    return execSync(`which ${cmd}`, { encoding: 'utf8' }).trim() || null;
  } catch { return null; }
}

// 复刻 packages/ob-plugin/src/lark/cli.ts 的候选数组
const CLI_CANDIDATES = [
  () => process.env.LARK_CLI_BIN ?? null,
  () => which('larksuite-cli'),
  () => which('lark-cli'),
  () => {
    const nvmBase = path.join(os.homedir(), '.nvm/versions/node');
    try {
      const dirs = execSync(`ls "${nvmBase}"`, { encoding: 'utf8' }).trim().split('\n');
      const latest = dirs.sort().pop();
      return latest ? path.join(nvmBase, latest, 'bin', 'lark-cli') : null;
    } catch { return null; }
  },
  () => path.join(os.homedir(), '.local', 'bin', 'lark-cli'),
  () => '/opt/homebrew/bin/lark-cli',
  () => '/usr/local/bin/lark-cli',
];

function tryProbe(cliPath) {
  if (!cliPath) return { ok: false, reason: 'null' };
  try {
    const ver = execSync(`"${cliPath}" --version`, { encoding: 'utf8', timeout: 5000 }).trim();
    const m = ver.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return { ok: false, version: ver, reason: '版本无数字' };
    const [a, b, c] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    const ok = a > MIN_VERSION[0] || (a === MIN_VERSION[0] && b > MIN_VERSION[1]) ||
      (a === MIN_VERSION[0] && b === MIN_VERSION[1] && c >= MIN_VERSION[2]);
    return { ok, version: `${a}.${b}.${c}`, raw: ver };
  } catch (e) {
    return { ok: false, reason: String(e.message).split('\n')[0] };
  }
}

console.log('========== lark-cli 自动探测自检 ==========\n');

// 1. 默认探测顺序命中
console.log('[1] 默认探测逐候选结果：');
let firstHit = null;
CLI_CANDIDATES.forEach((fn, i) => {
  const p = fn();
  const r = p ? tryProbe(p) : { ok: false, reason: '候选返回 null' };
  const tag = r.ok ? '✅' : '❌';
  console.log(`  候选[${i}] ${p ?? '(null)'}`);
  console.log(`         ${tag} ${r.version || r.reason}`);
  if (r.ok && !firstHit) firstHit = { idx: i, path: p, version: r.version };
});
console.log(`\n  → 首个命中：${firstHit ? `候选[${firstHit.idx}] ${firstHit.version} @ ${firstHit.path}` : '无'}`);

// 2. PATH 环境与 lark-cli 登录态
console.log('\n[2] PATH 中 lark-cli 可见性 + 登录态：');
console.log(`  which lark-cli:    ${which('lark-cli') ?? '(不在 PATH)'}`);
console.log(`  LARK_CLI_BIN:      ${process.env.LARK_CLI_BIN || '(未设)'}`);
try {
  const loginInfo = execSync(`lark-cli auth +who`, { encoding: 'utf8', timeout: 8000 }).trim();
  console.log(`  lark-cli auth who: ${loginInfo.slice(0, 120)}`);
} catch (e) {
  console.log(`  lark-cli auth who: ❌ ${String(e.message).split('\n')[0]}`);
}

// 3. nvm 多版本排序逻辑（验证多设备 node 版本漂移）
console.log('\n[3] nvm 目录排序（验证多 node 版本场景）：');
const nvmBase = path.join(os.homedir(), '.nvm/versions/node');
try {
  const dirs = execSync(`ls "${nvmBase}"`, { encoding: 'utf8' }).trim().split('\n');
  console.log(`  原始:  ${dirs.join(', ')}`);
  console.log(`  sort:  ${[...dirs].sort().join(', ')}`);
  console.log(`  latest:${dirs.sort().pop()}`);
  // 警告：字符串 sort 对 v10 vs v9 会错（v9 > v10），这里是已知风险
  const nums = dirs.map(d => parseInt(d.replace('v', ''))).sort((x, y) => x - y);
  console.log(`  数字序:${nums.join(', ')}（字符串 sort 与数字序是否一致：${dirs.sort().pop() === 'v' + nums[nums.length - 1] ? '是' : '否 ⚠️'}）`);
} catch (e) {
  console.log(`  nvm 目录不存在: ${String(e.message).split('\n')[0]}`);
}

// 4. 版本解析覆盖
console.log('\n[4] 版本字符串解析覆盖：');
const samples = ['lark-cli version 1.0.52', '@larksuite/cli/1.0.52', '1.0.52', 'v2.0.0-beta.3', 'lark-cli 0.9.1', '1.0.53', '1.0.51'];
samples.forEach(s => {
  const m = s.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return console.log(`  '${s}' → 无法解析`);
  const [a, b, c] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  const ok = a > 1 || (a === 1 && b > 0) || (a === 1 && b === 0 && c >= 52);
  console.log(`  '${s}' → ${a}.${b}.${c} ${ok ? '达标' : '过低'}`);
});

console.log('\n========== 自检完成 ==========');
