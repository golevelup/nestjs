export interface Cache {
  get: (key: string) => Promise<any | null | undefined>;
  set: (key: string, data: any, ttl: number) => Promise<void>;
  del: (key: string) => Promise<void>;
}
