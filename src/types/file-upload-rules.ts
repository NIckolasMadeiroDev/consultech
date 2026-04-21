export type FileUploadRules = {
  maxFileBytes: number;
  maxFiles: number;
  allowedExtensions: string[];
  required: boolean;
};

export const DEFAULT_FILE_UPLOAD_RULES: FileUploadRules = {
  maxFileBytes: 5 * 1024 * 1024,
  maxFiles: 1,
  allowedExtensions: ["pdf", "png", "jpg", "jpeg"],
  required: false,
};
