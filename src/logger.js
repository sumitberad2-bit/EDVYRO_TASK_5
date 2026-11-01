const levels = { info: 30, warn: 40, error: 50 };
function write(level, message, metadata = {}) {
  const record = { timestamp: new Date().toISOString(), level, message, ...metadata };
  const output = JSON.stringify(record);
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(output);
}
export const logger = {
  info: (message, metadata) => write('info', message, metadata),
  warn: (message, metadata) => write('warn', message, metadata),
  error: (message, metadata) => write('error', message, metadata)
};
