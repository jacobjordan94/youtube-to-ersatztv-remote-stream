export interface Env {
  YOUTUBE_API_KEY: string;
  CACHE?: KVNamespace;
  ENVIRONMENT?: string;
  [key: string]: string | KVNamespace | undefined;
}
