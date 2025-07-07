export class Logger {
  static info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  static message(message: string): void {
    console.log(`${message}`);
  }

  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  static warning(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  static error(message: string): void {
    console.error(`❌ ${message}`);
  }

  static debug(message: string, data?: unknown): void {
    if (process.env.DEBUG) {
      console.log(`🔍 ${message}`, data ? data : "");
    }
  }
}
