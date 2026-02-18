export interface TranslationFile {
  path: string;
  content?: string;
  newContent?: string;
}

export interface UpdatedFile {
  [filePath: string]: {
    addedKeys: Record<string, string>;
    deletedKeys: string[];
  };
}

export interface TranslationBundle extends Array<TranslationFile> {}

export interface RepositoryConfig {
  mainBranch: string;
  filesToSync: TranslationBundle[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TranslationApiResponse {
  files: TranslationBundle[];
  updatedFiles: UpdatedFile[];
}

export type UpdateTranslationOriginalFormat =
  | "json"
  | "yaml"
  | "yml"
  | "po"
  | "pot"
  | "resx"
  | "xml"
  | "arb"
  | "xcstrings"
  | "ts"
  | "js";

export type UpdateTranslationRequest =
  | {
      json: Record<string, unknown>;
      tags?: string[];
    }
  | {
      content: string;
      fileName?: string;
      originalFormat?: UpdateTranslationOriginalFormat;
      tags?: string[];
    };

export interface UpdateTranslationResponseKey {
  key: string;
  value: string;
  updated: boolean;
}

export interface UpdateTranslationResponseOtherTranslations {
  success: boolean;
  filesUpdated?: number;
  keysAdded?: number;
}

export interface UpdateTranslationResponseTags {
  success?: boolean;
  tags_added?: number;
  keys_tagged?: number;
  added_count?: number;
  message?: string;
  error?: string;
}

export interface UpdateTranslationResponse {
  success: boolean;
  message: string;
  branch?: string;
  keys?: UpdateTranslationResponseKey[];
  total_keys?: number;
  override?: boolean;
  auto_translate?: boolean;
  wait_for_translations?: boolean;
  other_translations?: UpdateTranslationResponseOtherTranslations;
  tags?: UpdateTranslationResponseTags;
}

/** Translation file object from Get Translation File API (key-value pairs). */
export type TranslationObject = Record<string, string>;
