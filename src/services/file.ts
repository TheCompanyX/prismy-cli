import fs from "fs";
import { TranslationBundle } from "../types/index.js";
import { Logger } from "../utils/logger.js";

export class FileService {
  static readFileContent(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      Logger.warning(
        `Could not read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  static writeFileContent(filePath: string, content: string): void {
    try {
      fs.writeFileSync(filePath, content, "utf8");
      Logger.debug(`File written: ${filePath}`);
    } catch (error) {
      throw new Error(
        `Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  static loadFileContents(bundles: TranslationBundle[]): TranslationBundle[] {
    return bundles.map((bundle) =>
      bundle.map((file) => ({
        ...file,
        content: this.readFileContent(file.path) || undefined,
      }))
    );
  }

  static saveTranslationFiles(bundles: TranslationBundle[]): void {
    bundles.forEach((bundle) => {
      bundle.forEach((file) => {
        if (file.newContent) {
          this.writeFileContent(file.path, file.newContent);
        }
      });
    });
  }

  static filterBundlesByChangedFiles(
    bundles: TranslationBundle[],
    changedFiles: Set<string>
  ): TranslationBundle[] {
    return bundles.filter((bundle) => bundle.some((file) => changedFiles.has(file.path)));
  }
}
