export const DEBUG = (import.meta as any).env?.VITE_DEBUG === 'true';

export const log = (...args: any[]) => {
    if (DEBUG) console.log(...args);
};

export const info = (...args: any[]) => {
    if (DEBUG) console.info(...args);
};

export const warn = (...args: any[]) => {
    if (DEBUG) console.warn(...args);
};

export const error = (...args: any[]) => {
    if (DEBUG) console.error(...args);
};
