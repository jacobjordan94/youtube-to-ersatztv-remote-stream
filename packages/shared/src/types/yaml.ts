export interface RemoteStreamConfig {
  script: string;
  is_live: boolean;
  duration?: string;
}

export interface YamlGenerationOptions {
  includeDuration: boolean;
  scriptTemplate: string;
}
