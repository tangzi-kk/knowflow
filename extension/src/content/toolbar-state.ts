export type ToolbarPhase =
  | 'idle'
  | 'capsule'
  | 'loading'
  | 'streaming'
  | 'result'
  | 'error'
  | 'closing';

export interface ToolbarUiState {
  phase: ToolbarPhase;
  requestId: string | null;
  content: string;
  error: string | null;
}

export type ToolbarEvent =
  | { type: 'SHOW_CAPSULE' }
  | { type: 'START'; requestId: string }
  | { type: 'CHUNK'; requestId: string; chunk: string }
  | { type: 'DONE'; requestId: string; text?: string }
  | { type: 'FAIL'; requestId: string; error: string }
  | { type: 'CLOSE' }
  | { type: 'RESET' };

export function initialToolbarState(): ToolbarUiState {
  return { phase: 'idle', requestId: null, content: '', error: null };
}

export function reduceToolbarState(state: ToolbarUiState, event: ToolbarEvent): ToolbarUiState {
  switch (event.type) {
    case 'SHOW_CAPSULE':
      return { phase: 'capsule', requestId: null, content: '', error: null };
    case 'START':
      return event.requestId
        ? { phase: 'loading', requestId: event.requestId, content: '', error: null }
        : state;
    case 'CHUNK':
      if (!acceptsStreamEvent(state, event.requestId)) return state;
      return { ...state, phase: 'streaming', content: state.content + event.chunk };
    case 'DONE':
      if (!acceptsStreamEvent(state, event.requestId)) return state;
      return { ...state, phase: 'result', content: event.text || state.content, error: null };
    case 'FAIL':
      if (!acceptsStreamEvent(state, event.requestId)) return state;
      return { ...state, phase: 'error', error: event.error };
    case 'CLOSE':
      return { phase: 'closing', requestId: null, content: '', error: null };
    case 'RESET':
      return initialToolbarState();
  }
}

function acceptsStreamEvent(state: ToolbarUiState, requestId: string): boolean {
  return Boolean(requestId)
    && requestId === state.requestId
    && (state.phase === 'loading' || state.phase === 'streaming');
}
