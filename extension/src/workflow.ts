export type WorkflowState =
  | 'queued'
  | 'awaiting-confirmation'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type WorkflowKind = 'fetch' | 'clip' | 'pushback';

export interface WorkflowResult {
  path: string;
  action: string;
}

export interface WorkflowOperation {
  operationId: string;
  requestId: string;
  kind: WorkflowKind;
  state: WorkflowState;
  createdAt: number;
  updatedAt: number;
  result?: WorkflowResult;
  error?: { code: string; message: string };
}

export interface WorkflowStorage {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

interface WorkflowOptions {
  idFactory?: () => string;
  now?: () => number;
  maxOperations?: number;
}

interface TransitionPayload {
  result?: WorkflowResult;
  error?: { code?: string; message?: string };
}

const STORAGE_KEY = 'knowflow_operations_v1';
const TERMINAL_STATES = new Set<WorkflowState>(['succeeded', 'failed', 'cancelled']);
const TRANSITIONS: Record<WorkflowState, readonly WorkflowState[]> = {
  queued: ['awaiting-confirmation', 'running', 'failed', 'cancelled'],
  'awaiting-confirmation': ['running', 'failed', 'cancelled'],
  running: ['succeeded', 'failed', 'cancelled'],
  succeeded: [],
  failed: [],
  cancelled: [],
};

class WorkflowTransitionError extends Error {
  code = 'INVALID_OPERATION_TRANSITION';
}

export class WorkflowStore {
  private readonly storage: WorkflowStorage;
  private readonly idFactory: () => string;
  private readonly now: () => number;
  private readonly maxOperations: number;
  private tail: Promise<void> = Promise.resolve();

  constructor(storage: WorkflowStorage, options: WorkflowOptions = {}) {
    this.storage = storage;
    this.idFactory = options.idFactory ?? (() => globalThis.crypto.randomUUID());
    this.now = options.now ?? Date.now;
    this.maxOperations = Math.max(1, options.maxOperations ?? 50);
  }

  create(kind: WorkflowKind, requestId: string): Promise<WorkflowOperation> {
    return this.mutate((operations) => {
      const timestamp = this.now();
      const operation: WorkflowOperation = {
        operationId: this.idFactory(),
        requestId,
        kind,
        state: 'queued',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      operations.push(operation);
      return operation;
    });
  }

  transition(
    operationId: string,
    nextState: WorkflowState,
    payload: TransitionPayload = {},
  ): Promise<WorkflowOperation> {
    return this.mutate((operations) => {
      const operation = operations.find((item) => item.operationId === operationId);
      if (!operation) throw new WorkflowTransitionError(`Unknown operation: ${operationId}`);
      if (!TRANSITIONS[operation.state].includes(nextState)) {
        throw new WorkflowTransitionError(`Cannot transition ${operation.state} to ${nextState}`);
      }
      operation.state = nextState;
      operation.updatedAt = this.now();
      delete operation.result;
      delete operation.error;
      if (nextState === 'succeeded') {
        if (!payload.result?.path || !payload.result.action) {
          throw new WorkflowTransitionError('Succeeded operation requires a final path and action');
        }
        operation.result = { path: payload.result.path, action: payload.result.action };
      }
      if (nextState === 'failed') {
        operation.error = {
          code: payload.error?.code || 'OPERATION_FAILED',
          message: redactMessage(payload.error?.message || 'Operation failed'),
        };
      }
      return operation;
    });
  }

  async run<T extends WorkflowResult>(
    kind: WorkflowKind,
    requestId: string,
    task: () => Promise<T>,
  ): Promise<T> {
    const operation = await this.create(kind, requestId);
    await this.transition(operation.operationId, 'running');
    try {
      const result = await task();
      await this.transition(operation.operationId, 'succeeded', { result });
      return result;
    } catch (error) {
      await this.transition(operation.operationId, 'failed', {
        error: {
          code: errorCode(error),
          message: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  list(): Promise<WorkflowOperation[]> {
    return this.withLock(async () => {
      const operations = await this.read();
      return structuredClone(operations.sort((left, right) => right.updatedAt - left.updatedAt));
    });
  }

  recoverInterrupted(): Promise<number> {
    return this.mutate((operations) => {
      let recovered = 0;
      for (const operation of operations) {
        if (operation.state !== 'running' && operation.state !== 'queued') continue;
        operation.state = 'failed';
        operation.updatedAt = this.now();
        operation.error = {
          code: 'WORKER_RESTARTED',
          message: '浏览器后台在操作完成前重启，本次结果未确认，请检查 Obsidian 后再重试。',
        };
        recovered += 1;
      }
      return recovered;
    });
  }

  private mutate<T>(change: (operations: WorkflowOperation[]) => T): Promise<T> {
    return this.withLock(async () => {
      const operations = await this.read();
      const result = change(operations);
      await this.storage.set({ [STORAGE_KEY]: this.prune(operations) });
      return structuredClone(result);
    });
  }

  private withLock<T>(task: () => Promise<T>): Promise<T> {
    const execution = this.tail.then(task, task);
    this.tail = execution.then(() => undefined, () => undefined);
    return execution;
  }

  private async read(): Promise<WorkflowOperation[]> {
    const stored = (await this.storage.get(STORAGE_KEY))[STORAGE_KEY];
    if (!Array.isArray(stored)) return [];
    return stored.filter(isWorkflowOperation).map((operation) => structuredClone(operation));
  }

  private prune(operations: WorkflowOperation[]): WorkflowOperation[] {
    const active = operations.filter((operation) => !TERMINAL_STATES.has(operation.state));
    const terminal = operations
      .filter((operation) => TERMINAL_STATES.has(operation.state))
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, Math.max(0, this.maxOperations - active.length));
    return [...active, ...terminal];
  }
}

function isWorkflowOperation(value: unknown): value is WorkflowOperation {
  if (!value || typeof value !== 'object') return false;
  const operation = value as Partial<WorkflowOperation>;
  return typeof operation.operationId === 'string'
    && typeof operation.requestId === 'string'
    && typeof operation.kind === 'string'
    && typeof operation.state === 'string'
    && typeof operation.createdAt === 'number'
    && typeof operation.updatedAt === 'number';
}

function errorCode(error: unknown): string {
  return error && typeof error === 'object' && typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : 'OPERATION_FAILED';
}

function redactMessage(message: string): string {
  return message
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/\b(token|api[_-]?key|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, 'sk-[REDACTED]')
    .slice(0, 500);
}

let chromeStore: WorkflowStore | undefined;
let recoveryPromise: Promise<number> | undefined;

export function getChromeWorkflowStore(): WorkflowStore {
  chromeStore ??= new WorkflowStore(chrome.storage.local as unknown as WorkflowStorage);
  return chromeStore;
}

export async function runWorkflowOperation<T extends WorkflowResult>(
  kind: WorkflowKind,
  requestId: string,
  task: () => Promise<T>,
): Promise<T> {
  await ensureWorkflowRecovery();
  return getChromeWorkflowStore().run(kind, requestId, task);
}

export async function recoverInterruptedOperations(): Promise<number> {
  return ensureWorkflowRecovery();
}

function ensureWorkflowRecovery(): Promise<number> {
  recoveryPromise ??= getChromeWorkflowStore().recoverInterrupted();
  return recoveryPromise;
}
