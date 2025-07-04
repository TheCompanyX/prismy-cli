export interface TranslationFile {
  path: string;
  content?: string;
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
}
