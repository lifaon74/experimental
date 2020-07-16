
export type TExecutionContext = 'browser' | 'nodejs';

export function GetExecutionContext(): TExecutionContext {
  if (new Function('try{return this===window;}catch(e){return false;}')()) {
    return 'browser';
  } else if (new Function('try{return this===global;}catch(e){return false;}')()) {
    return 'nodejs';
  } else {
    throw new Error(`Unknown execution context`);
  }
}

export const EXECUTION_CONTEXT: TExecutionContext = GetExecutionContext();
