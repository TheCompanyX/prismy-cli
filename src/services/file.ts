import fs from "fs";
import path from "path";
import {
  TranslationBundle,
  UpdateTranslationOriginalFormat,
  UpdateTranslationRequest,
} from "../types/index.js";
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

  static detectOriginalFormat(filePath: string): UpdateTranslationOriginalFormat | undefined {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".json":
        return "json";
      case ".yaml":
        return "yaml";
      case ".yml":
        return "yml";
      case ".po":
        return "po";
      case ".pot":
        return "pot";
      case ".resx":
        return "resx";
      case ".xml":
        return "xml";
      case ".arb":
        return "arb";
      case ".xcstrings":
        return "xcstrings";
      case ".ts":
        return "ts";
      case ".js":
        return "js";
      default:
        return undefined;
    }
  }

  static buildUpdateTranslationRequestFromFile(
    filePath: string,
    tags?: string[]
  ): UpdateTranslationRequest {
    const content = this.readFileContent(filePath);
    if (content === null) {
      throw new Error(`Could not read file: ${filePath}`);
    }

    const normalizedTags = tags?.map((t) => t.trim()).filter(Boolean);
    const fileName = path.basename(filePath);
    const originalFormat = this.detectOriginalFormat(filePath);

    if (originalFormat === "json" || originalFormat === "arb" || originalFormat === "xcstrings") {
      try {
        const parsed = JSON.parse(content) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return {
            json: parsed as Record<string, unknown>,
            tags: normalizedTags && normalizedTags.length > 0 ? normalizedTags : undefined,
          };
        }
      } catch {
        // fall back to raw content upload
      }
    }

    return {
      content,
      fileName,
      originalFormat,
      tags: normalizedTags && normalizedTags.length > 0 ? normalizedTags : undefined,
    };
  }
}
