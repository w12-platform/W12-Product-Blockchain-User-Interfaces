export const isDev = process.env.NODE_ENV === 'development';
export const isDevWarnEnabled = !!process.env.DEV_DEBUG_WARNINGS;
export const isDevLogEnabled = !!process.env.DEV_DEBUG_LOGS;
export const isDevErrorsEnabled = !!process.env.DEV_DEBUG_ERRORS;

export function devWarn(...args) {
    if (isDev && isDevWarnEnabled) {
        console.warn(...args);
    }
}

export function devLog(...args) {
    if (isDev && isDevLogEnabled) {
        console.log(...args);
    }
}

export function devError(...args) {
    if (isDev && isDevErrorsEnabled) {
        console.error(...args);
    }
}
