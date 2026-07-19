/**
 * lark-cli 封装层。依据 `rc-x/scripts/rc_env.py` + `03_格式规范.md` §十/十一。
 *
 * - resolveCli()：候选路径探测，版本校验 ≥ 1.0.52
 * - run()：统一 spawnSync 包装，重试、相对路径、emoji 清洗、~反转义、JSON 包装解包
 * - 标题修复：overwrite 后追加 str_replace 修 <title>
 *
 * 多设备适配关键点：
 * - GUI 启动的 Obsidian 拿不到终端 PATH（nvm/homebrew 不在内），故 spawn 时注入增强 PATH
 * - nvm 目录按数字序取 latest（字符串 sort 会让 v9 > v10）
 */
import { execFileSync, type ExecFileSyncOptionsWithStringEncoding } from 'node:child_process';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { stripVariationSelectors, unescapeFeishuTilde } from '@sync/shared';

const MIN_VERSION = [1, 0, 52];

/**
 * 构造增强 PATH：在进程现有 PATH 前追加 nvm/latest/bin + 常见安装位。
 * 用于 GUI 启动的 Obsidian（PATH 缺 nvm/homebrew，导致 #!/usr/bin/env node 找不到 node）。
 */
function buildEnhancedPath(): string {
  const extra: string[] = [];
  // nvm latest node 的 bin
  const nvmBase = path.join(os.homedir(), '.nvm/versions/node');
  try {
    const dirs = fs.readdirSync(nvmBase);
    // 数字序取最大版本（v9 vs v10 字符串排序会错）
    const latest = dirs
      .map(d => ({ name: d, ver: parseInt(d.replace(/^v/, ''), 10) }))
      .filter(x => !Number.isNaN(x.ver))
      .sort((a, b) => a.ver - b.ver)
      .pop();
    if (latest) extra.push(path.join(nvmBase, latest.name, 'bin'));
  } catch { /* nvm 未装 */ }
  extra.push(path.join(os.homedir(), '.local', 'bin'));
  extra.push('/opt/homebrew/bin');
  extra.push('/usr/local/bin');
  const base = process.env.PATH ?? '';
  return [...extra.filter(p => !base.split(path.delimiter).includes(p)), base].join(path.delimiter);
}

/** run() 共用的增强 PATH（首次解析后缓存）。 */
let enhancedPath: string | undefined;
let cliEnabled = true;

function getEnhancedPath(): string {
  return enhancedPath ??= buildEnhancedPath();
}

/**
 * 在增强 PATH 下查找可执行文件路径（替代 `which`，避免 GUI 进程 PATH 缺失）。
 * 用 execFileSync 不走 shell，更稳。
 */
function which(cmd: string): string | null {
  // 先试当前 PATH（终端场景）
  try {
    const found = execFileSync('/usr/bin/which', [cmd], {
      encoding: 'utf8',
      timeout: 3000,
      env: { ...process.env },
    }).trim();
    if (found) return found;
  } catch { /* fall through */ }
  // 再试增强 PATH（GUI 场景）
  try {
    const found = execFileSync('/usr/bin/which', [cmd], {
      encoding: 'utf8',
      timeout: 3000,
      env: { ...process.env, PATH: getEnhancedPath() },
    }).trim();
    return found || null;
  } catch {
    return null;
  }
}

/** 候选路径（移植 rc_env.py resolve_cli）。 */
const CLI_CANDIDATES: (() => string | null)[] = [
  () => process.env.LARK_CLI_BIN ?? null,
  () => which('larksuite-cli'),
  () => which('lark-cli'),
  () => {
    const nvmBase = path.join(os.homedir(), '.nvm/versions/node');
    try {
      const dirs = fs.readdirSync(nvmBase);
      // 数字序取最大版本（字符串 sort 会让 v9 > v10）
      const latest = dirs
        .map(d => ({ name: d, ver: parseInt(d.replace(/^v/, ''), 10) }))
        .filter(x => !Number.isNaN(x.ver))
        .sort((a, b) => a.ver - b.ver)
        .pop();
      return latest ? path.join(nvmBase, latest.name, 'bin', 'lark-cli') : null;
    } catch {
      return null;
    }
  },
  () => path.join(os.homedir(), '.local', 'bin', 'lark-cli'),
  () => '/opt/homebrew/bin/lark-cli',
  () => '/usr/local/bin/lark-cli',
];

/**
 * 探测 lark-cli 路径。优先用设置覆盖，否则走候选路径。
 * @returns { path, version } 或 null（未找到）
 */
export function resolveCli(overridePath?: string): { path: string; version: string } | null {
  const candidates = overridePath
    ? [() => overridePath]
    : CLI_CANDIDATES;

  for (const getCli of candidates) {
    const cli = getCli();
    if (!cli) continue;
    try {
      // 用 execFileSync 直接跑 cli，注入增强 PATH（解决 GUI 进程 env node 找不到的问题）
      const ver = execFileSync(cli, ['--version'], {
        encoding: 'utf8',
        timeout: 5000,
        env: { ...process.env, PATH: getEnhancedPath() },
      }).trim();
      // 解析 "lark-cli version 1.0.52"
      const match = ver.match(/(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        const patch = parseInt(match[3], 10);
        if (
          major > MIN_VERSION[0] ||
          (major === MIN_VERSION[0] && minor > MIN_VERSION[1]) ||
          (major === MIN_VERSION[0] && minor === MIN_VERSION[1] && patch >= MIN_VERSION[2])
        ) {
          return { path: cli, version: ver };
        }
      }
      // 版本解析失败但有输出，仍可用
      if (ver) return { path: cli, version: ver };
    } catch {
      continue;
    }
  }
  return null;
}

/** run() 执行选项。 */
export interface RunOptions {
  /** 工作目录（--content @file 用相对路径时需要）。 */
  cwd?: string;
  /** 最大重试次数（默认 3）。 */
  retries?: number;
  /** 超时 ms（默认 30s）。 */
  timeout?: number;
  /** 期望 JSON 输出时 true，自动跳过 "Found X node(s)" 前缀。 */
  json?: boolean;
  /** 包含重试等待在内的总截止时间。 */
  totalTimeout?: number;
}

/**
 * 执行 lark-cli 命令。统一处理已知坑。
 *
 * @param args lark-cli 子命令参数数组，如 ['docs', '+fetch', '--doc', token, '--doc-format', 'markdown']
 * @param options 选项
 * @returns stdout（已清洗）
 */
export function run(args: string[], options: RunOptions = {}): string {
  if (!cliEnabled) throw Object.assign(new Error('lark-cli is disabled because the plugin is unloading'), { code: 'CLI_UNLOADING' });
  const { cwd, retries = 3, timeout = 30000, totalTimeout = timeout * Math.max(1, retries), json = false } = options;
  const cliPath = process.env.__LARK_CLI_PATH__ || 'lark-cli';
  const deadline = Date.now() + Math.max(1, totalTimeout);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw Object.assign(new Error('lark-cli total deadline exceeded'), { code: 'CLI_DEADLINE' });
      const fullArgs = [...args];
      const execOpts: ExecFileSyncOptionsWithStringEncoding = {
        encoding: 'utf8',
        timeout: Math.min(timeout, remaining),
        maxBuffer: 10 * 1024 * 1024, // 10MB（大文档）
        // 注入增强 PATH：GUI 启动的 Obsidian 拿不到 nvm/homebrew，导致
        // `#!/usr/bin/env node` 找不到 node（cli 是 node 脚本）
        env: { ...process.env, PATH: getEnhancedPath() },
      };

      // 处理 --content @file：用相对路径（坑：绝对路径被拒）
      const contentIdx = fullArgs.indexOf('--content');
      if (contentIdx !== -1 && contentIdx + 1 < fullArgs.length) {
        const contentVal = fullArgs[contentIdx + 1];
        if (contentVal.startsWith('@')) {
          const filePath = contentVal.slice(1);
          const dir = cwd || path.dirname(filePath);
          const baseName = path.basename(filePath);
          fullArgs[contentIdx + 1] = `@./${baseName}`;
          execOpts.cwd = dir;
        }
      } else if (cwd) {
        execOpts.cwd = cwd;
      }

      // 写入前 emoji 清洗：扫描 fullArgs 中 --content @file 的文件内容
      if (contentIdx !== -1 && contentIdx + 1 < fullArgs.length) {
        const filePath = fullArgs[contentIdx + 1].replace(/^@\.\//, '');
        const executionDirectory = typeof execOpts.cwd === 'string' ? execOpts.cwd : process.cwd();
        const fullFilePath = path.join(executionDirectory, filePath);
        try {
          let content = fs.readFileSync(fullFilePath, 'utf8');
          content = stripVariationSelectors(content);
          // 反转义 \~ → ~（飞书读回来时转义了波浪号）
          content = content.replace(/\\~/g, '~');
          fs.writeFileSync(fullFilePath, content, 'utf8');
        } catch {
          // 文件读不到就跳过清洗
        }
      }

      // 用 execFileSync 直接执行，不走 shell（参数安全 + 增强 PATH 生效）
      let stdout = execFileSync(cliPath, fullArgs, execOpts);

      // 回读后反转义：飞书 md 把 ~ 转义成 \~
      stdout = unescapeFeishuTilde(stdout);

      // 解包 lark-cli 标准 JSON 包装：{ok, identity, data:{document:{content}}} → 纯正文
      // docs +fetch 默认 --format json，正文嵌在 data.document.content 里
      stdout = unwrapLarkEnvelope(stdout);

      // JSON 模式：跳过 "Found X node(s)" 前缀（坑：node-list 输出含日志行）
      if (json) {
        const braceIdx = stdout.indexOf('{');
        if (braceIdx !== -1) {
          stdout = stdout.slice(braceIdx);
        }
      }

      return stdout.trim();
    } catch (err: unknown) {
      lastError = err as Error;
      const errMsg = (err as Error)?.message ?? String(err);

      // 429 限流或网络错误：重试（指数退避）
      if (isRetryableCliFailure(errMsg)) {
        const remaining = deadline - Date.now();
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000, Math.max(0, remaining));
        if (attempt >= retries || delay <= 0) break;
        console.warn(`[sync/lark] attempt ${attempt} failed, retrying in ${delay}ms: ${errMsg}`);
        // 不依赖 shell 的 sleep（Atomics.wait 同步阻塞）
        const ms = delay;
        const buf = new Int32Array(new SharedArrayBuffer(4));
        Atomics.wait(buf, 0, 0, ms);
        continue;
      }

      // 其他错误直接抛
      break;
    }
  }

  throw lastError ?? new Error('lark-cli run failed with unknown error');
}

export function disableCli(): void {
  cliEnabled = false;
}

export function enableCli(): void {
  cliEnabled = true;
}

export function isRetryableCliFailure(message: string): boolean {
  return message.includes('429')
    || message.includes('ETIMEDOUT')
    || message.includes('ECONNRESET')
    || message.includes('socket hang up');
}

/**
 * 解包 lark-cli 标准 JSON 包装。
 *
 * lark-cli 的 docs +fetch 等命令默认 `--format json`，返回：
 *   { "ok": true, "identity": "...", "data": { "document": { "content": "<真实正文>" } }, ... }
 * 同步链路需要的是纯正文（markdown/xml），不是整个 envelope。
 *
 * 判定：stdout 首个非空白字符是 `{`，且解析后含 ok 字段 + data.document.content，
 * 才认为是 envelope 并解包；否则原样返回（保留 wiki +node-list 等纯 JSON 响应给 json 模式处理）。
 */
function unwrapLarkEnvelope(stdout: string): string {
  const trimmed = stdout.trimStart();
  if (!trimmed.startsWith('{')) return stdout;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return stdout; // 不是合法 JSON，原样返回
  }
  const env = parsed as { ok?: unknown; data?: { document?: { content?: unknown } } };
  // 仅当是含 document.content 的标准 envelope 才解包
  if (env && typeof env.ok === 'boolean' && env.data?.document?.content !== undefined) {
    const content = env.data.document.content;
    return typeof content === 'string' ? content : JSON.stringify(content);
  }
  return stdout;
}

/**
 * 回写飞书文档（markdown overwrite + 标题修复）。
 * 依据已知坑：overwrite 后标题变 Untitled → 追加 str_replace 修 <title>。
 *
 * @param token docx obj_token 或 node_token
 * @param content 正文 markdown（不含 frontmatter）
 * @param title 文档标题（带 emoji）
 * @param cwd 工作目录（用于 @file 相对路径）
 */
export function overwriteDoc(token: string, content: string, title: string, _cwd?: string): void {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'knowflow-write-'));
  const tmpFile = path.join(tmpDir, 'content.md');

  // 清洗：strip emoji VS + 反转义 \~
  const cleaned = stripVariationSelectors(content);

  fs.writeFileSync(tmpFile, cleaned, 'utf8');

  try {
    // overwrite
    run(['docs', '+update', '--doc', token, '--command', 'overwrite', '--doc-format', 'markdown', '--content', '@./content.md'], { cwd: tmpDir });

    // 标题修复：str_replace 修 <title>
    const cleanTitle = stripVariationSelectors(title);
    run([
      'docs', '+update', '--doc', token,
      '--command', 'str_replace',
      '--doc-format', 'json',
      '--content', JSON.stringify({
        request: [{
          block_type: 1, // page
          page: {
            elements: [{
              text_run: { content: cleanTitle, text_element_style: { bold: true } }
            }]
          }
        }],
        index: 0,
      }),
    ], { cwd: tmpDir, timeout: 15000 });
  } finally {
    // 清理临时文件
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

/**
 * 回写飞书文档（XML 格式，含 callout 精确控制）。
 * 同样需要标题修复。
 */
export function overwriteDocXml(token: string, xmlContent: string, title: string, _cwd?: string): void {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'knowflow-write-'));
  const tmpFile = path.join(tmpDir, 'content.xml');

  const cleaned = stripVariationSelectors(xmlContent);
  fs.writeFileSync(tmpFile, cleaned, 'utf8');

  try {
    run(['docs', '+update', '--doc', token, '--command', 'overwrite', '--doc-format', 'xml', '--content', '@./content.xml'], { cwd: tmpDir });

    // 标题修复
    const cleanTitle = stripVariationSelectors(title);
    run([
      'docs', '+update', '--doc', token,
      '--command', 'str_replace',
      '--doc-format', 'json',
      '--content', JSON.stringify({
        request: [{
          block_type: 1,
          page: {
            elements: [{
              text_run: { content: cleanTitle, text_element_style: { bold: true } }
            }]
          }
        }],
        index: 0,
      }),
    ], { cwd: tmpDir, timeout: 15000 });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

/**
 * 从飞书 wiki URL 解析 node_token。
 * URL 形如：https://xxx.feishu.cn/wiki/NODE_TOKEN、/docx/OBJ_TOKEN 或 /doc/OBJ_TOKEN
 */
export function resolveNodeTokenFromUrl(url: string): { node_token?: string; obj_token?: string } {
  // wiki node
  const wikiMatch = url.match(/\/wiki\/([A-Za-z0-9]+)/);
  if (wikiMatch) return { node_token: wikiMatch[1] };

  // docx obj
  const docxMatch = url.match(/\/docx\/([A-Za-z0-9]+)/);
  if (docxMatch) return { obj_token: docxMatch[1] };

  return {};
}

/**
 * 获取 wiki 节点的 docx obj_token。
 * `wiki +node-get --node-token <url> --space-id <id>`
 */
export function getWikiNodeInfo(nodeToken: string, spaceId: string): { obj_token: string; title: string } | null {
  try {
    const output = run([
      'wiki', '+node-get',
      '--node-token', nodeToken,
      '--space-id', spaceId,
    ], { json: true });
    const data = JSON.parse(output);
    // 节点可能有 node 或直接是 obj_token
    const objToken = data?.node?.obj_token ?? data?.obj_token ?? data?.obj_token;
    const title = data?.node?.title ?? data?.title ?? '';
    if (objToken) return { obj_token: objToken, title };
    return null;
  } catch (err) {
    console.warn('[sync/lark] wiki +node-get failed:', err);
    return null;
  }
}

/**
 * 获取飞书知识库子节点列表。
 */
export function listWikiChildren(spaceId: string, parentToken: string): Array<{ node_token: string; title: string; obj_token: string }> {
  try {
    const output = run([
      'wiki', '+node-list',
      '--space-id', spaceId,
      '--parent-node-token', parentToken,
    ], { json: true });
    const data = JSON.parse(output);
    const items = data?.items ?? data?.nodes ?? [];
    return items.map((n: Record<string, unknown>) => ({
      node_token: n.node_token ?? '',
      title: n.title ?? '',
      obj_token: n.obj_token ?? '',
    }));
  } catch (err) {
    console.warn('[sync/lark] wiki +node-list failed:', err);
    return [];
  }
}
