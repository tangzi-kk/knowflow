import { createHash, randomUUID } from 'node:crypto';
import type { App } from 'obsidian';
import { assembleFile, inspectFrontmatter } from '@sync/shared';
import { createRecoverySnapshot, rotateRecoverySnapshots } from './recovery.js';
import type { SyncCoordinator } from './syncCoordinator.js';
import {
  recognizeDocument,
  type DocumentRecognitionResult,
} from './documentRecognition.js';
import {
  ALLOWED_STATUSES,
  ALLOWED_TAGS,
  datePrefixFromDate,
  deriveShortEncoding,
  expandShortEncoding,
  encodingTag,
  FILE_PREFIX_RE,
  FULL_ENCODING_RE,
  LEGACY_FILE_PREFIX_RE,
  PROTOCOL_VERSION,
  SHORT_ENCODING_RE,
  SHORT_FILE_PREFIX_RE,
} from './knowledgeContract.js';

const ARRAY_FIELDS = [
  '日期索引',
  '关键词',
  '索引_块',
  '索引_风险',
  '关联项目',
  '关联文档',
  '关联人物',
] as const;
const PROTECTED_PATH_RE = /^(?:(?:.*\/)?AGENTS\.md$|🪧导引(?:\/|$)|\.[^/]+(?:\/|$))/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface VaultFileLike {
  path: string;
  name: string;
  basename: string;
  extension: string;
  parent?: { path: string } | null;
}

interface VaultFolderLike {
  path: string;
  children: unknown[];
}

export interface KnowledgeChangeScope {
  kind: 'file' | 'directory' | 'selection';
  depth: 'direct' | 'recursive';
  mode?: 'organize' | 'auto' | 'manual' | 'clear';
  manualCode?: string;
}

export interface KnowledgePlanItem {
  originalPath: string;
  expectedContentHash: string;
  originalContent: string;
  newContent: string;
  newPath: string;
  code: string;
  shortCode: string;
  documentId: string;
  changedFields: string[];
  warnings: string[];
  recognition?: DocumentRecognitionResult;
}

export interface KnowledgeChangePlan {
  operationId: string;
  scope: KnowledgeChangeScope;
  targetPaths: string[];
  items: KnowledgePlanItem[];
  skipped: number;
  warnings: string[];
  blockedReasons: string[];
  conflicts: string[];
}

export interface KnowledgeSyncEvent {
  schemaVersion: 1;
  eventId: string;
  operationId: string;
  type: 'note.created' | 'note.updated' | 'note.renamed';
  occurredAt: string;
  documentId: string;
  path: string;
  encoding: string;
  shortEncoding: string;
  contentHash: string;
  changedFields: string[];
}

export interface KnowledgeTransactionResult {
  operationId: string;
  status: 'committed' | 'rolled_back' | 'rollback_failed';
  changedPaths: string[];
  recoveryPaths: string[];
  syncEvents: KnowledgeSyncEvent[];
  rollbackErrors: string[];
  deliveryErrors: string[];
}

interface AppliedJournal {
  plan: KnowledgeChangePlan;
  result: KnowledgeTransactionResult;
  rollbackResult?: KnowledgeTransactionResult;
}

export interface KnowledgeWorkflowHooks {
  rebuildIndex?: () => Promise<void>;
  emitSyncEvents?: (events: KnowledgeSyncEvent[]) => Promise<void>;
  appendAudit?: (result: KnowledgeTransactionResult) => Promise<void>;
}

export interface KnowledgeWorkflow {
  previewTargets(paths: string[], scope: KnowledgeChangeScope): Promise<KnowledgeChangePlan>;
  commitPlan(operationId: string): Promise<KnowledgeTransactionResult>;
  rollbackOperation(operationId: string): Promise<KnowledgeTransactionResult>;
}

export function createKnowledgeWorkflow(
  app: App,
  coordinator: SyncCoordinator,
  hooks: KnowledgeWorkflowHooks = {},
): KnowledgeWorkflow {
  const plans = new Map<string, KnowledgeChangePlan>();
  const applied = new Map<string, AppliedJournal>();

  return {
    async previewTargets(paths, scope) {
      const plan = await previewKnowledgeTargets(app, paths, scope);
      plans.set(plan.operationId, plan);
      return plan;
    },
    commitPlan(operationId) {
      const plan = plans.get(operationId);
      if (!plan) throw codedError('KNOWLEDGE_PLAN_MISSING', `整理计划不存在或已过期：${operationId}`);
      return coordinator.run('knowledge:vault', operationId, async () => {
        const result = await commitKnowledgePlan(app, plan, hooks);
        applied.set(operationId, { plan, result });
        plans.delete(operationId);
        return result;
      });
    },
    rollbackOperation(operationId) {
      const journal = applied.get(operationId);
      if (!journal) throw codedError('KNOWLEDGE_ROLLBACK_MISSING', `没有可回滚的操作：${operationId}`);
      return coordinator.run('knowledge:vault', `rollback:${operationId}`, async () => {
        if (journal.rollbackResult) {
          return retryRollbackDelivery(journal, hooks, applied);
        }
        await verifyRollbackFresh(app, journal.plan, journal.result.recoveryPaths);
        const result = await restorePlan(
          app,
          journal.plan,
          journal.result.recoveryPaths,
          new Map(),
          true,
        );
        if (result.status === 'rolled_back') {
          await hooks.rebuildIndex?.();
          result.syncEvents = journal.plan.items.map((item) =>
            buildRollbackSyncEvent(operationId, item));
          try {
            await hooks.emitSyncEvents?.(result.syncEvents);
          } catch (error) {
            result.deliveryErrors.push(messageOf(error));
            journal.rollbackResult = result;
          }
        }
        if (result.status === 'rolled_back' && result.deliveryErrors.length === 0) {
          applied.delete(operationId);
        }
        await hooks.appendAudit?.(result);
        return result;
      });
    },
  };
}

export async function previewKnowledgeTargets(
  app: App,
  paths: string[],
  scope: KnowledgeChangeScope,
): Promise<KnowledgeChangePlan> {
  const operationId = randomUUID();
  const targetPaths = [...new Set(paths.map(normalizePath))];
  const warnings: string[] = [];
  const blockedReasons: string[] = [];
  const conflicts: string[] = [];
  const expansion = expandTargets(app, targetPaths, scope, blockedReasons);
  const files = expansion.files;
  const targetFilePaths = new Set(files.map((file) => file.path));
  const occupied = await collectOccupiedEncodings(app);
  const reservedCodes = new Set<string>();
  const reservedPaths = new Set<string>();
  const items: KnowledgePlanItem[] = [];
  let skipped = expansion.skipped;

  for (const file of files) {
    if (PROTECTED_PATH_RE.test(file.path)) {
      blockedReasons.push(`${file.path}：受保护路径不允许整理`);
      continue;
    }
    const itemResult = await buildPlanItem(
      app,
      file,
      scope,
      occupied,
      reservedCodes,
      targetFilePaths,
    );
    if ('blocked' in itemResult) {
      blockedReasons.push(...itemResult.blocked.map((reason) => `${file.path}：${reason}`));
      warnings.push(...itemResult.warnings.map((warning) => `${file.path}：${warning}`));
      continue;
    }
    if (!itemResult.item) {
      skipped += 1;
      warnings.push(...itemResult.warnings.map((warning) => `${file.path}：${warning}`));
      continue;
    }
    const { item } = itemResult;
    warnings.push(...itemResult.warnings.map((warning) => `${file.path}：${warning}`));
    const existing = app.vault.getAbstractFileByPath(item.newPath);
    const occupiedByMovingPlanItem = existing
      && targetFilePaths.has(existing.path)
      && existing.path !== item.originalPath;
    const hasConflict = (
      (existing && item.newPath !== item.originalPath && !occupiedByMovingPlanItem)
      || reservedPaths.has(item.newPath)
    );
    if (hasConflict) {
      conflicts.push(`${item.originalPath} → ${item.newPath}`);
      blockedReasons.push(`${item.originalPath}：目标路径已被占用，自动编码跳过`);
      // 自动模式继续提交同一批次的安全项；手动模式保留冲突项并整体停在预览中。
      if (scope.mode === 'auto') continue;
    }
    reservedPaths.add(item.newPath);
    items.push(item);
  }

  return {
    operationId,
    scope,
    targetPaths,
    items,
    skipped,
    warnings,
    blockedReasons: [...new Set(blockedReasons)],
    conflicts: [...new Set(conflicts)],
  };
}

export async function commitKnowledgePlan(
  app: App,
  plan: KnowledgeChangePlan,
  hooks: KnowledgeWorkflowHooks = {},
): Promise<KnowledgeTransactionResult> {
  if (plan.blockedReasons.length && plan.scope.mode !== 'auto') {
    throw codedError('KNOWLEDGE_PLAN_BLOCKED', `整理计划被阻止：${plan.blockedReasons.join('；')}`);
  }
  if (plan.conflicts.length && plan.scope.mode !== 'auto') {
    throw codedError('KNOWLEDGE_PLAN_CONFLICT', `整理计划存在冲突：${plan.conflicts.join('；')}`);
  }

  await verifyPlanFresh(app, plan);
  const recoveryPaths: string[] = [];
  for (const item of plan.items) {
    try {
      recoveryPaths.push(await createRecoverySnapshot(app.vault.adapter, {
        originalPath: item.originalPath,
        content: item.originalContent,
        source: 'local',
        // 事务恢复点不得在同一批次完成前被普通轮转淘汰。
        deferRotation: true,
      }));
    } catch (error) {
      let rotationFailure = '';
      try {
        await rotateRecoverySnapshots(
          app.vault.adapter,
          Math.max(200, recoveryPaths.length),
          recoveryPaths,
        );
      } catch (rotationError) {
        rotationFailure = `；恢复点轮转失败：${messageOf(rotationError)}`;
      }
      const existingRecovery = recoveryPaths.length
        ? `；已创建恢复点：${recoveryPaths[0]}（共 ${recoveryPaths.length} 个）`
        : '';
      throw codedError(
        'KNOWLEDGE_BACKUP_FAILED',
        `整理事务未开始：${item.originalPath} 备份失败（${messageOf(error)}）${existingRecovery}${rotationFailure}`,
      );
    }
  }
  await rotateRecoverySnapshots(
    app.vault.adapter,
    Math.max(200, recoveryPaths.length),
    recoveryPaths,
  );

  const changedPaths: string[] = [];
  const temporaryPaths = new Map<string, string>();
  try {
    for (const item of plan.items) {
      const file = app.vault.getAbstractFileByPath(item.originalPath);
      if (!isMarkdownFile(file)) throw staleError(item.originalPath, '写入前文件不存在');
      try {
        await app.vault.modify(file as never, item.newContent);
      } catch (error) {
        throw operationError('写入', item.originalPath, error);
      }
    }

    const renameItems = plan.items.filter((item) => item.newPath !== item.originalPath);
    for (const [index, item] of renameItems.entries()) {
      const file = app.vault.getAbstractFileByPath(item.originalPath);
      if (!isMarkdownFile(file)) throw staleError(item.originalPath, '临时换序前文件不存在');
      const temporaryPath = transactionTemporaryPath(item.originalPath, plan.operationId, index);
      if (app.vault.getAbstractFileByPath(temporaryPath)) {
        throw staleError(item.originalPath, `临时路径已被占用：${temporaryPath}`);
      }
      temporaryPaths.set(item.originalPath, temporaryPath);
      try {
        await renameWithLinks(app, file, temporaryPath);
      } catch (error) {
        throw operationError('临时换序', `${item.originalPath} → ${temporaryPath}`, error);
      }
    }
    for (const item of plan.items) {
      if (item.newPath === item.originalPath) {
        changedPaths.push(item.originalPath);
        continue;
      }
      const temporaryPath = temporaryPaths.get(item.originalPath);
      const file = temporaryPath
        ? app.vault.getAbstractFileByPath(temporaryPath)
        : null;
      if (!isMarkdownFile(file)) throw staleError(item.originalPath, '最终换序前临时文件不存在');
      try {
        await renameWithLinks(app, file, item.newPath);
      } catch (error) {
        throw operationError('最终换序', `${temporaryPath} → ${item.newPath}`, error);
      }
      changedPaths.push(item.newPath);
    }

    try {
      await hooks.rebuildIndex?.();
    } catch (error) {
      throw operationError('重建索引', plan.operationId, error);
    }
    const syncEvents = plan.items.map((item) => buildSyncEvent(plan.operationId, item));
    const result: KnowledgeTransactionResult = {
      operationId: plan.operationId,
      status: 'committed',
      changedPaths,
      recoveryPaths,
      syncEvents,
      rollbackErrors: [],
      deliveryErrors: [],
    };
    await hooks.appendAudit?.(result);
    try {
      await hooks.emitSyncEvents?.(syncEvents);
    } catch (error) {
      result.deliveryErrors.push(error instanceof Error ? error.message : String(error));
    }
    return result;
  } catch (error) {
    const rollback = await restorePlan(app, plan, recoveryPaths, temporaryPaths);
    await hooks.appendAudit?.(rollback);
    const detail = error instanceof Error ? error.message : String(error);
    const transactionError = codedError(
      rollback.status === 'rolled_back' ? 'KNOWLEDGE_TRANSACTION_ROLLED_BACK' : 'KNOWLEDGE_ROLLBACK_FAILED',
      `整理事务失败并${rollback.status === 'rolled_back' ? '已回滚' : '回滚不完整'}：${detail}`
        + (recoveryPaths.length ? `；恢复点：${recoveryPaths[0]}（共 ${recoveryPaths.length} 个）` : ''),
    ) as Error & { result?: KnowledgeTransactionResult };
    transactionError.result = rollback;
    throw transactionError;
  }
}

export async function restorePlan(
  app: App,
  plan: KnowledgeChangePlan,
  recoveryPaths: string[] = [],
  temporaryPaths: ReadonlyMap<string, string> = new Map(),
  verifyCommittedState = false,
): Promise<KnowledgeTransactionResult> {
  const rollbackErrors: string[] = [];
  const restored: string[] = [];
  const located = new Map<string, VaultFileLike>();
  const usedFiles = new Set<VaultFileLike>();
  const orderedItems = [...plan.items].reverse();

  for (const [index, item] of orderedItems.entries()) {
    try {
      const candidates = [
        item.newPath,
        item.originalPath,
        temporaryPaths.get(item.originalPath),
        rollbackTemporaryPath(item.originalPath, plan.operationId, index),
      ].filter((path): path is string => Boolean(path))
        .map((path): unknown => app.vault.getAbstractFileByPath(path))
        .filter((value): value is VaultFileLike => isMarkdownFile(value) && !usedFiles.has(value));
      const current = await findRollbackCandidate(app, candidates, item);
      if (!isMarkdownFile(current)) throw new Error('无法定位事务中的文件');
      usedFiles.add(current);
      located.set(item.originalPath, current);
    } catch (error) {
      rollbackErrors.push(`${item.originalPath}：${messageOf(error)}`);
      if (verifyCommittedState) break;
    }
  }

  if (rollbackErrors.length === 0) {
    for (const [index, item] of orderedItems.entries()) {
      const current = located.get(item.originalPath);
      if (!current || current.path === item.originalPath) continue;
      try {
        if (verifyCommittedState) {
          await assertRollbackContentFresh(app, current, item, recoveryPaths);
        }
        const rollbackPath = rollbackTemporaryPath(item.originalPath, plan.operationId, index);
        const occupant: unknown = app.vault.getAbstractFileByPath(rollbackPath);
        if (occupant && occupant !== current) throw new Error(`回滚临时路径已被占用：${rollbackPath}`);
        await renameWithLinks(app, current, rollbackPath);
      } catch (error) {
        rollbackErrors.push(`${item.originalPath}：${messageOf(error)}`);
        break;
      }
    }
  }

  if (rollbackErrors.length === 0) {
    for (const item of orderedItems) {
      const current = located.get(item.originalPath);
      if (!current) continue;
      try {
        if (verifyCommittedState) {
          await assertRollbackContentFresh(app, current, item, recoveryPaths);
        }
        if (current.path !== item.originalPath) {
          const occupant: unknown = app.vault.getAbstractFileByPath(item.originalPath);
          if (occupant && occupant !== current) throw new Error(`原路径已被占用：${item.originalPath}`);
          await renameWithLinks(app, current, item.originalPath);
        }
      } catch (error) {
        rollbackErrors.push(`${item.originalPath}：${messageOf(error)}`);
        break;
      }
    }
  }

  if (rollbackErrors.length === 0) {
    for (const item of orderedItems) {
      try {
        const original = app.vault.getAbstractFileByPath(item.originalPath);
        if (!isMarkdownFile(original)) throw new Error('恢复路径后无法定位文件');
        if (verifyCommittedState) {
          await assertRollbackContentFresh(app, original, item, recoveryPaths);
        }
        await app.vault.modify(original as never, item.originalContent);
        restored.push(item.originalPath);
      } catch (error) {
        rollbackErrors.push(`${item.originalPath}：${messageOf(error)}`);
        break;
      }
    }
  }
  return {
    operationId: plan.operationId,
    status: rollbackErrors.length ? 'rollback_failed' : 'rolled_back',
    changedPaths: restored,
    recoveryPaths,
    syncEvents: [],
    rollbackErrors,
    deliveryErrors: [],
  };
}

async function buildPlanItem(
  app: App,
  file: VaultFileLike,
  scope: KnowledgeChangeScope,
  occupied: Map<string, string[]>,
  reservedCodes: Set<string>,
  targetFilePaths: ReadonlySet<string>,
): Promise<
  | { item: KnowledgePlanItem | null; warnings: string[] }
  | { blocked: string[]; warnings: string[] }
> {
  const content = await app.vault.read(file as never);
  const inspected = inspectFrontmatter(content);
  if (inspected.status === 'invalid') {
    return { blocked: [`frontmatter 损坏：${inspected.error ?? '无法解析'}`], warnings: [] };
  }

  const before = inspected.frontmatter ?? {};
  const next = cloneRecord(before);
  const warnings: string[] = [];
  const blocked: string[] = [];
  const filenameFullCode = file.basename.match(FILE_PREFIX_RE)?.[1] ?? '';
  const filenameShortCode = file.basename.match(SHORT_FILE_PREFIX_RE)?.[1] ?? '';
  const legacyFilenameCode = file.basename.match(LEGACY_FILE_PREFIX_RE)?.[1] ?? '';
  const yamlCode = stringValue(before.编码);
  const datePrefix = datePrefixFromDate(stringValue(before.日期));
  const filenameCode = filenameFullCode || (filenameShortCode
    ? expandShortEncoding(filenameShortCode, datePrefix)
    : '');
  const currentCode = FULL_ENCODING_RE.test(yamlCode)
    ? yamlCode
    : FULL_ENCODING_RE.test(filenameCode) ? filenameCode : '';
  const mode = scope.mode ?? 'organize';
  const recognition = mode === 'auto'
    ? recognizeDocument({
      path: file.path,
      title: file.basename
        .replace(FILE_PREFIX_RE, '')
        .replace(LEGACY_FILE_PREFIX_RE, '')
        .replace(/\.md$/i, '')
        .trim(),
      body: inspected.body,
      frontmatter: before,
    })
    : undefined;

  if (yamlCode && !FULL_ENCODING_RE.test(yamlCode)) warnings.push(`旧版或非法 YAML 编码：${yamlCode}`);
  if (legacyFilenameCode && !filenameCode) warnings.push(`旧版文件名编码：${legacyFilenameCode}`);
  if (filenameCode && yamlCode && filenameCode !== yamlCode) {
    blocked.push(`文件名编码与 YAML 编码冲突（${filenameCode} / ${yamlCode}）`);
  }

  let code = '';
  if (mode === 'clear') {
    code = '';
  } else if (mode === 'manual') {
    const manualCode = scope.manualCode?.trim() ?? '';
    if (FULL_ENCODING_RE.test(manualCode)) {
      code = manualCode;
    } else if (SHORT_ENCODING_RE.test(manualCode)) {
      const existingDatePrefix = currentCode.match(/^(\d{2}_\d{4})_/)?.[1] ?? datePrefix;
      code = expandShortEncoding(manualCode, existingDatePrefix);
    } else {
      blocked.push(`手动编码格式不合法：${manualCode || '空'}`);
    }
  } else if (currentCode) {
    const selectedTag = stringValue(before.标签);
    if (ALLOWED_TAGS.includes(selectedTag) && encodingTag(currentCode) !== selectedTag) {
      const parts = currentCode.split('_');
      code = `${parts[0]}_${parts[1]}_${selectedTag}_${parts[3]}_${parts.slice(4).join('_')}`;
      warnings.push(`标签已变化，编码标签段将由 ${encodingTag(currentCode)} 更新为 ${selectedTag}`);
    } else if (mode === 'auto' && !ALLOWED_TAGS.includes(selectedTag)) {
      next.标签 = encodingTag(currentCode);
      code = currentCode;
      warnings.push(`自动识别沿用现有编码标签：${next.标签}`);
    } else {
      code = currentCode;
    }
  } else {
    const tag = stringValue(before.标签);
    const autoTag = mode === 'auto' ? recognition?.tag ?? 'S' : '';
    const selectedTag = ALLOWED_TAGS.includes(tag) ? tag : autoTag;
    if (!ALLOWED_TAGS.includes(selectedTag)) {
      blocked.push('缺少合法标签，不能由目录猜测标签');
    } else {
      if (mode === 'auto' && tag !== selectedTag) {
        next.标签 = selectedTag;
        warnings.push(`自动识别标签为 ${selectedTag}（${recognition?.confidence ?? 'low'}）：${recognition?.reason ?? ''}`);
      }
      code = allocateEncoding(before, selectedTag, occupied, reservedCodes);
    }
  }

  if (code) {
    const tag = encodingTag(code);
    const existingTag = stringValue(next.标签);
    if (existingTag && existingTag !== tag) {
      if (mode === 'manual') {
        next.标签 = tag;
        warnings.push(`手动短编码同步标签：${existingTag} → ${tag}`);
      } else {
        blocked.push(`标签与编码字母冲突（${existingTag} / ${tag}）`);
      }
    } else if (!existingTag && (mode === 'manual' || mode === 'auto')) {
      next.标签 = tag;
    }
    const owners = occupied.get(code) ?? [];
    if (
      owners.some((path) => path !== file.path && !targetFilePaths.has(path))
      || reservedCodes.has(code)
    ) {
      blocked.push(`编码重复：${code}`);
    }
    next.编码 = code;
    next.短编码 = deriveShortEncoding(code);
    reservedCodes.add(code);
  } else {
    delete next.编码;
    delete next.短编码;
  }

  normalizeRequiredFields(next, before, blocked, warnings, mode);
  if (blocked.length) return { blocked, warnings };

  const unprefixedName = file.basename
    .replace(FILE_PREFIX_RE, '')
    .replace(LEGACY_FILE_PREFIX_RE, '')
    .replace(SHORT_FILE_PREFIX_RE, '');
  const directory = normalizePath(file.parent?.path ?? '');
  const visibleCode = code ? deriveShortEncoding(code) : '';
  const titleWithoutVisibleCode = visibleCode
    ? stripVisibleCodePrefix(unprefixedName, visibleCode)
    : unprefixedName;
  const newName = visibleCode
    ? `${visibleCode} ${titleWithoutVisibleCode}.${file.extension}`
    : `${titleWithoutVisibleCode}.${file.extension}`;
  const newPath = joinPath(directory, newName);
  const newContent = assembleFile(next, inspected.body, {
    hasBom: inspected.hasBom,
    lineEnding: inspected.lineEnding,
  });
  const changedFields = diffFields(before, next);
  if (newPath !== file.path) changedFields.push('path');
  if (newContent === content && newPath === file.path) return { item: null, warnings };

  return {
    warnings,
    item: {
      originalPath: file.path,
      expectedContentHash: hashContent(content),
      originalContent: content,
      newContent,
      newPath,
      code,
      shortCode: code ? deriveShortEncoding(code) : '',
      documentId: String(next.文档ID),
      changedFields: [...new Set(changedFields)],
      warnings,
      recognition,
    },
  };
}

function normalizeRequiredFields(
  next: Record<string, unknown>,
  before: Record<string, unknown>,
  blocked: string[],
  warnings: string[],
  mode: KnowledgeChangeScope['mode'],
): void {
  next.协议版本 = PROTOCOL_VERSION;
  const documentId = stringValue(before.文档ID);
  if (documentId && !UUID_RE.test(documentId)) {
    blocked.push(`文档ID非法：${documentId}`);
  } else {
    next.文档ID = documentId || randomUUID();
  }

  const tag = stringValue(next.标签);
  if (!ALLOWED_TAGS.includes(tag)) blocked.push(`标签缺失或非法：${tag || '空'}`);

  const date = stringValue(before.日期);
  next.日期 = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : new Date().toISOString().slice(0, 10);

  const status = stringValue(before.状态);
  if (status && !ALLOWED_STATUSES.includes(status)) {
    blocked.push(`状态不在封闭枚举中：${status}`);
  } else {
    next.状态 = status || '收集';
  }

  for (const field of ARRAY_FIELDS) {
    const value = before[field];
    if (Array.isArray(value)) {
      next[field] = [...new Set(value.map(String).filter(Boolean))];
    } else if (value === undefined || value === null || value === '') {
      next[field] = [];
    } else if (field === '关键词') {
      if (mode === 'auto') {
        next[field] = [String(value)];
        warnings.push('关键词已按单项列表标准化');
      } else {
        blocked.push('关键词仍是旧字符串，必须在预览中人工确认拆分');
      }
    } else {
      next[field] = [String(value)];
    }
  }
}

function allocateEncoding(
  frontmatter: Record<string, unknown>,
  tag: string,
  occupied: Map<string, string[]>,
  reservedCodes: Set<string>,
): string {
  const date = stringValue(frontmatter.日期);
  const stableDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : new Date().toISOString().slice(0, 10);
  const timestamp = `${stableDate.slice(2, 4)}_${stableDate.slice(5, 7)}${stableDate.slice(8, 10)}`;
  for (let sequence = 1; sequence <= 99; sequence += 1) {
    const code = `${timestamp}_${tag}_${String(sequence).padStart(2, '0')}_a1`;
    if (!occupied.has(code) && !reservedCodes.has(code)) return code;
  }
  throw codedError('KNOWLEDGE_NAMESPACE_FULL', `${timestamp}_${tag} 命名空间已满`);
}

async function collectOccupiedEncodings(app: App): Promise<Map<string, string[]>> {
  const occupied = new Map<string, string[]>();
  const files = typeof app.vault.getMarkdownFiles === 'function'
    ? app.vault.getMarkdownFiles()
    : [];
  for (const file of files) {
    if (!isMarkdownFile(file) || PROTECTED_PATH_RE.test(file.path)) continue;
    let code = file.basename.match(FILE_PREFIX_RE)?.[1] ?? '';
    try {
      const inspected = inspectFrontmatter(await app.vault.read(file as never));
      const yamlCode = stringValue(inspected.frontmatter?.编码);
      if (FULL_ENCODING_RE.test(yamlCode)) code = yamlCode;
      if (!code) {
        const shortCode = file.basename.match(SHORT_FILE_PREFIX_RE)?.[1] ?? '';
        if (SHORT_ENCODING_RE.test(shortCode)) {
          code = expandShortEncoding(shortCode, datePrefixFromDate(stringValue(inspected.frontmatter?.日期)));
        }
      }
    } catch {
      // 损坏文档会在自己的预览中阻断，不参与猜测。
    }
    if (!code) continue;
    occupied.set(code, [...(occupied.get(code) ?? []), file.path]);
  }
  return occupied;
}

function expandTargets(
  app: App,
  paths: string[],
  scope: KnowledgeChangeScope,
  blockedReasons: string[],
): { files: VaultFileLike[]; skipped: number } {
  const result: VaultFileLike[] = [];
  let skipped = 0;
  for (const path of paths) {
    const target = path
      ? app.vault.getAbstractFileByPath(path)
      : app.vault.getRoot();
    if (isMarkdownFile(target)) {
      result.push(target);
      continue;
    }
    if (isFolder(target)) {
      if (scope.depth === 'recursive') {
        result.push(...collectMarkdownFiles(target));
      } else {
        result.push(...target.children.filter(isMarkdownFile));
      }
      continue;
    }
    if (scope.kind === 'selection') {
      skipped += 1;
    } else {
      blockedReasons.push(`${path || '/'}：不是可整理的 Markdown 文件或目录`);
    }
  }
  return {
    files: [...new Map(result.map((file) => [file.path, file])).values()],
    skipped,
  };
}

function collectMarkdownFiles(folder: VaultFolderLike): VaultFileLike[] {
  const files: VaultFileLike[] = [];
  for (const child of folder.children) {
    if (isMarkdownFile(child)) {
      files.push(child);
    } else if (isFolder(child)) {
      files.push(...collectMarkdownFiles(child));
    }
  }
  return files;
}

async function verifyPlanFresh(app: App, plan: KnowledgeChangePlan): Promise<void> {
  const originalPaths = new Set(plan.items.map((item) => item.originalPath));
  const occupied = await collectOccupiedEncodings(app);
  for (const item of plan.items) {
    const file = app.vault.getAbstractFileByPath(item.originalPath);
    if (!isMarkdownFile(file)) throw staleError(item.originalPath, '文件已移动或不存在');
    const content = await app.vault.read(file as never);
    if (hashContent(content) !== item.expectedContentHash) {
      throw staleError(item.originalPath, '内容已变化');
    }
    if (item.newPath !== item.originalPath) {
      const target = app.vault.getAbstractFileByPath(item.newPath);
      if (target && target !== file && !originalPaths.has(target.path)) {
        throw staleError(item.originalPath, `目标路径已被占用：${item.newPath}`);
      }
    }
    if (item.code) {
      const owners = occupied.get(item.code) ?? [];
      const outsidePlan = owners.filter((path) => path !== item.originalPath && !originalPaths.has(path));
      if (outsidePlan.length) {
        throw staleError(item.originalPath, `编码已被占用：${item.code} → ${outsidePlan.join(', ')}`);
      }
    }
  }
}

async function verifyRollbackFresh(
  app: App,
  plan: KnowledgeChangePlan,
  recoveryPaths: string[],
): Promise<void> {
  const orderedItems = [...plan.items].reverse();
  for (const [index, item] of orderedItems.entries()) {
    const candidates = [
      item.newPath,
      item.originalPath,
      rollbackTemporaryPath(item.originalPath, plan.operationId, index),
    ].map((path): unknown => app.vault.getAbstractFileByPath(path))
      .filter(isMarkdownFile);
    const current = await findRollbackCandidate(app, candidates, item);
    if (!isMarkdownFile(current)) {
      throw codedError(
        'KNOWLEDGE_ROLLBACK_STALE',
        `拒绝覆盖式回滚（${item.newPath}）：提交后的文件已移动；原恢复点：${recoveryPaths[0] ?? '无'}`,
      );
    }
    const currentContent = await app.vault.read(current as never);
    if (
      hashContent(currentContent) === hashContent(item.newContent)
      || hashContent(currentContent) === hashContent(item.originalContent)
    ) continue;
    const currentRecovery = await createRecoverySnapshot(app.vault.adapter, {
      originalPath: current.path,
      content: currentContent,
      source: 'local',
    });
    throw codedError(
      'KNOWLEDGE_ROLLBACK_STALE',
      `拒绝覆盖式回滚（${item.newPath}）：提交后内容已变化；当前内容恢复点：${currentRecovery}`,
    );
  }
}

async function findRollbackCandidate(
  app: App,
  candidates: VaultFileLike[],
  item: KnowledgePlanItem,
): Promise<VaultFileLike | undefined> {
  const expectedHashes = new Set([
    hashContent(item.newContent),
    hashContent(item.originalContent),
  ]);
  for (const candidate of candidates) {
    const content = await app.vault.read(candidate as never);
    if (expectedHashes.has(hashContent(content))) return candidate;
  }
  return candidates[0];
}

async function assertRollbackContentFresh(
  app: App,
  current: VaultFileLike,
  item: KnowledgePlanItem,
  recoveryPaths: string[],
): Promise<void> {
  const currentContent = await app.vault.read(current as never);
  const currentHash = hashContent(currentContent);
  if (
    currentHash === hashContent(item.newContent)
    || currentHash === hashContent(item.originalContent)
  ) {
    return;
  }
  const currentRecovery = await createRecoverySnapshot(app.vault.adapter, {
    originalPath: current.path,
    content: currentContent,
    source: 'local',
  });
  throw codedError(
    'KNOWLEDGE_ROLLBACK_STALE',
    `拒绝覆盖式回滚（${item.newPath}）：提交后内容已变化；当前内容恢复点：${currentRecovery}`
      + `；原恢复点：${recoveryPaths[0] ?? '无'}`,
  );
}

async function renameWithLinks(app: App, file: VaultFileLike, newPath: string): Promise<void> {
  const fileManager = (app as App & {
    fileManager?: { renameFile?: (file: unknown, path: string) => Promise<void> };
  }).fileManager;
  if (fileManager?.renameFile) {
    await fileManager.renameFile(file, newPath);
  } else {
    await app.vault.rename(file as never, newPath);
  }
}

function buildSyncEvent(operationId: string, item: KnowledgePlanItem): KnowledgeSyncEvent {
  return {
    schemaVersion: 1,
    eventId: randomUUID(),
    operationId,
    type: item.originalPath === item.newPath ? 'note.updated' : 'note.renamed',
    occurredAt: new Date().toISOString(),
    documentId: item.documentId,
    path: item.newPath,
    encoding: item.code,
    shortEncoding: item.shortCode,
    contentHash: hashContent(item.newContent),
    changedFields: item.changedFields,
  };
}

function buildRollbackSyncEvent(
  operationId: string,
  item: KnowledgePlanItem,
): KnowledgeSyncEvent {
  const inspected = inspectFrontmatter(item.originalContent);
  const encoding = stringValue(inspected.frontmatter?.编码);
  const shortEncoding = stringValue(inspected.frontmatter?.短编码);
  return {
    schemaVersion: 1,
    eventId: randomUUID(),
    operationId: `rollback:${operationId}`,
    type: item.originalPath === item.newPath ? 'note.updated' : 'note.renamed',
    occurredAt: new Date().toISOString(),
    documentId: item.documentId,
    path: item.originalPath,
    encoding,
    shortEncoding,
    contentHash: hashContent(item.originalContent),
    changedFields: item.changedFields,
  };
}

async function retryRollbackDelivery(
  journal: AppliedJournal,
  hooks: KnowledgeWorkflowHooks,
  applied: Map<string, AppliedJournal>,
): Promise<KnowledgeTransactionResult> {
  const result = journal.rollbackResult;
  if (!result) throw new Error('回滚补偿状态不存在');
  result.deliveryErrors = [];
  try {
    await hooks.emitSyncEvents?.(result.syncEvents);
  } catch (error) {
    result.deliveryErrors.push(messageOf(error));
  }
  if (result.deliveryErrors.length === 0) {
    applied.delete(journal.plan.operationId);
    journal.rollbackResult = undefined;
  }
  await hooks.appendAudit?.(result);
  return result;
}

function diffFields(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]));
}

function cloneRecord(value: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '');
}

function joinPath(directory: string, name: string): string {
  return directory ? `${directory}/${name}` : name;
}

function stripVisibleCodePrefix(name: string, visibleCode: string): string {
  const prefix = `${visibleCode} `;
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

function transactionTemporaryPath(
  originalPath: string,
  operationId: string,
  index: number,
): string {
  const separator = originalPath.lastIndexOf('/');
  const directory = separator >= 0 ? originalPath.slice(0, separator) : '';
  return joinPath(directory, `.${operationId}.${index}.knowflow-tmp.md`);
}

function rollbackTemporaryPath(
  originalPath: string,
  operationId: string,
  index: number,
): string {
  const separator = originalPath.lastIndexOf('/');
  const directory = separator >= 0 ? originalPath.slice(0, separator) : '';
  return joinPath(directory, `.${operationId}.${index}.knowflow-rollback.md`);
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function isMarkdownFile(value: unknown): value is VaultFileLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<VaultFileLike>;
  return candidate.extension === 'md'
    && typeof candidate.path === 'string'
    && typeof candidate.basename === 'string';
}

function isFolder(value: unknown): value is VaultFolderLike {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as VaultFolderLike).children));
}

function staleError(path: string, reason: string): Error & { code: string } {
  return codedError('KNOWLEDGE_PLAN_STALE', `整理预览已过期（${path}）：${reason}`);
}

function codedError(code: string, message: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

function operationError(action: string, target: string, error: unknown): Error {
  return new Error(`${action}失败（${target}）：${messageOf(error)}`);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
