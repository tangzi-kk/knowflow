interface CoordinatorOptions {
  maxCompleted?: number;
  completedTtlMs?: number;
}

interface CachedResult {
  key: string;
  value: unknown;
  completedAt: number;
}

interface InflightResult {
  key: string;
  promise: Promise<unknown>;
}

class RequestConflictError extends Error {
  code = 'REQUEST_ID_CONFLICT';
  status = 409;
}

export class SyncCoordinator {
  private readonly maxCompleted: number;
  private readonly completedTtlMs: number;
  private readonly tails = new Map<string, Promise<void>>();
  private readonly inflight = new Map<string, InflightResult>();
  private readonly completed = new Map<string, CachedResult>();

  constructor(options: CoordinatorOptions = {}) {
    this.maxCompleted = Math.max(1, options.maxCompleted ?? 100);
    this.completedTtlMs = Math.max(1_000, options.completedTtlMs ?? 10 * 60_000);
  }

  get completedCount(): number {
    this.pruneCompleted();
    return this.completed.size;
  }

  async run<T>(key: string, requestId: string | undefined, task: () => Promise<T>): Promise<T> {
    const normalizedKey = key.trim();
    const normalizedRequestId = requestId?.trim();
    if (!normalizedKey) throw new Error('Coordinator key is required');
    if (normalizedRequestId && !/^[A-Za-z0-9._:-]{1,128}$/.test(normalizedRequestId)) {
      throw new Error('requestId contains unsupported characters or exceeds 128 characters');
    }

    this.pruneCompleted();
    if (normalizedRequestId) {
      const cached = this.completed.get(normalizedRequestId);
      if (cached) {
        this.assertSameKey(normalizedRequestId, cached.key, normalizedKey);
        return cached.value as T;
      }
      const active = this.inflight.get(normalizedRequestId);
      if (active) {
        this.assertSameKey(normalizedRequestId, active.key, normalizedKey);
        return active.promise as Promise<T>;
      }
    }

    const operation = this.enqueue(normalizedKey, task);
    if (!normalizedRequestId) return operation;

    const tracked = operation.then((value) => {
      this.remember(normalizedRequestId, normalizedKey, value);
      return value;
    }).finally(() => {
      this.inflight.delete(normalizedRequestId);
    });
    this.inflight.set(normalizedRequestId, { key: normalizedKey, promise: tracked });
    return tracked;
  }

  private enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release!: () => void;
    const slot = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.catch(() => {}).then(() => slot);
    this.tails.set(key, tail);

    return previous.catch(() => {}).then(task).finally(() => {
      release();
      if (this.tails.get(key) === tail) this.tails.delete(key);
    });
  }

  private assertSameKey(requestId: string, existingKey: string, requestedKey: string): void {
    if (existingKey !== requestedKey) {
      throw new RequestConflictError(`requestId ${requestId} is already bound to another document`);
    }
  }

  private remember(requestId: string, key: string, value: unknown): void {
    this.completed.delete(requestId);
    this.completed.set(requestId, { key, value, completedAt: Date.now() });
    while (this.completed.size > this.maxCompleted) {
      const oldest = this.completed.keys().next().value as string | undefined;
      if (!oldest) break;
      this.completed.delete(oldest);
    }
  }

  private pruneCompleted(): void {
    const cutoff = Date.now() - this.completedTtlMs;
    for (const [requestId, entry] of this.completed) {
      if (entry.completedAt >= cutoff) break;
      this.completed.delete(requestId);
    }
  }
}
