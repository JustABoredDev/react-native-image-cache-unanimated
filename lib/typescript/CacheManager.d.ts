import { Config, DownloadOptions } from './types';
export declare class CacheEntry {
    source: string;
    options: DownloadOptions | undefined;
    downloadPromise: Promise<string | undefined> | undefined;
    pathResolved: boolean;
    noCache: boolean | undefined;
    maxAge: number | undefined;
    constructor(source: string, options: DownloadOptions | undefined, noCache?: boolean, maxAge?: number);
    getPath(): Promise<string | undefined>;
    private download;
}
export default class CacheManager {
    static defaultConfig: Config;
    static config: Config;
    get config(): Config;
    set config(newConfig: Config);
    static entries: {
        [uri: string]: CacheEntry;
    };
    static get(source: string, options: DownloadOptions | undefined, noCache?: boolean, maxAge?: number): CacheEntry;
    static clearCache(): Promise<void>;
    static removeCacheEntry(entry: string): Promise<void>;
    static getCacheSize(): Promise<number>;
    static isImageCached(entry: string): Promise<boolean>;
    static prefetch(source: string | string[], options?: DownloadOptions): void;
    static prefetchBlob(source: string, options?: DownloadOptions): Promise<string | undefined>;
    static pruneCache(): Promise<void>;
}
//# sourceMappingURL=CacheManager.d.ts.map