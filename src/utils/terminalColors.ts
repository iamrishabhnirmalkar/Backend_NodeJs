/**
 * ANSI escape codes for colored terminal output.
 * Each HTTP method has a distinct color for easy reading.
 */

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const colors = {
  reset: RESET,
  bold: BOLD,
  dim: DIM,

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright foreground
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
} as const;

/** Colors per HTTP method for consistent, readable logs */
export const methodColors: Record<string, string> = {
  GET: colors.brightGreen,
  POST: colors.brightBlue,
  PUT: colors.brightYellow,
  PATCH: colors.brightCyan,
  DELETE: colors.brightRed,
  OPTIONS: colors.dim,
  HEAD: colors.brightMagenta,
};

/** Color for HTTP status code (2xx green, 3xx cyan, 4xx yellow, 5xx red) */
export function statusColor(status: number): string {
  if (status >= 500) return colors.brightRed;
  if (status >= 400) return colors.brightYellow;
  if (status >= 300) return colors.brightCyan;
  if (status >= 200) return colors.brightGreen;
  return colors.white;
}

export function methodColor(method: string): string {
  return methodColors[method] ?? colors.white;
}

export default colors;
