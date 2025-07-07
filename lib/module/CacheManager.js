// @ts-ignore
import SHA1 from 'crypto-js/sha1';
import { FileSystem } from 'react-native-file-access';
import defaultConfiguration from './defaultConfiguration';
async function retry(fn) {
  let retriesLeft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CacheManager.config.maxRetries || 0;
  let interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : CacheManager.config.retryDelay;
  try {
    /* for some reason FileSystem.fetch won't throw error if image is not found
     * we need to catch the errors locally
     */
    const request = await fn();
    switch (request.status) {
      case 404:
        throw new Error(request.status);
      case 401:
        throw new Error(request.status);
      case 408:
        throw new Error(request.status);
      case 500:
        throw new Error(request.status);
      case 503:
        throw new Error(request.status);
      default:
        return request;
    }
  } catch (error) {
    /* abort early if the image is not found or
     * the access is not authorized
     */
    if (error.message === '404' || error.message === '401' || error.message === '500' || error.message === '503' || error.message === '408') {
      throw new Error(error);
    }
    /* FileSystem.fetch throws error if device is offline/temp internet loss with message "Host unreachable" or "Unable to resolve host"
     * so keep trying
     */
    if (retriesLeft === 0) {
      throw new Error(`Maximum retries exceeded: ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
    return retry(fn, retriesLeft - 1, interval);
  }
}
export class CacheEntry {
  pathResolved = false;
  noCache = false;
  constructor(source, options, noCache, maxAge) {
    this.noCache = noCache;
    this.options = options;
    this.source = source;
    this.maxAge = maxAge;
  }
  async getPath() {
    const {
      source,
      maxAge,
      noCache
    } = this;
    const {
      exists,
      path
    } = await getCacheEntry(source, maxAge);
    if (exists && !noCache) {
      return path;
    }
    if (!this.downloadPromise) {
      this.pathResolved = false;
      this.downloadPromise = this.download(path);
    }
    if (this.downloadPromise && this.pathResolved) {
      this.pathResolved = false;
      this.downloadPromise = this.download(path);
    }
    return this.downloadPromise;
  }
  async download(path) {
    const {
      source,
      options,
      noCache
    } = this;
    /* if noCache is true then return the source uri without caching it */
    if (noCache) {
      return source;
    }
    if (source != null) {
      try {
        const result = await retry(() => FileSystem.fetch(source, {
          path,
          ...options
        }));
        /* If the image download failed, we don't cache anything */
        if (result && result.status !== 200) {
          this.downloadPromise = undefined;
          return undefined;
        }
      } catch (e) {
        if (__DEV__) {
          console.log(`FileSystem.fetch has some trouble, error: ${e instanceof Error ? e.message : 'unknown'}`);
        }
        this.downloadPromise = undefined;
        return undefined;
      }
      if (CacheManager.config.cacheLimit) {
        await CacheManager.pruneCache();
      }
      this.pathResolved = true;
      return path;
    }
    return source;
  }
}
export default class CacheManager {
  static defaultConfig = defaultConfiguration;
  get config() {
    return CacheManager.defaultConfig;
  }
  set config(newConfig) {
    CacheManager.defaultConfig = newConfig;
  }
  static entries = {};
  static get(source, options, noCache, maxAge) {
    var _CacheManager$entries, _options$headers;
    if (!CacheManager.entries[source] || ((_CacheManager$entries = CacheManager.entries[source].options) === null || _CacheManager$entries === void 0 || (_CacheManager$entries = _CacheManager$entries.headers) === null || _CacheManager$entries === void 0 ? void 0 : _CacheManager$entries.Authorization) !== (options === null || options === void 0 || (_options$headers = options.headers) === null || _options$headers === void 0 ? void 0 : _options$headers.Authorization)) {
      CacheManager.entries[source] = new CacheEntry(source, options, noCache, maxAge);
      return CacheManager.entries[source];
    }
    return CacheManager.entries[source];
  }
  static async clearCache() {
    if (await FileSystem.exists(CacheManager.config.baseDir)) {
      const files = await FileSystem.ls(CacheManager.config.baseDir);
      for (const file of files) {
        try {
          await FileSystem.unlink(`${CacheManager.config.baseDir}${file}`);
        } catch (e) {
          if (__DEV__) {
            console.log(`error while clearing images cache, error: ${e}`);
          }
        }
      }
    }
  }
  static async removeCacheEntry(entry) {
    try {
      const file = await getCacheEntry(entry);
      const {
        path
      } = file;
      await FileSystem.unlink(path);
    } catch (e) {
      throw new Error('error while clearing image from cache');
    }
  }
  static async getCacheSize() {
    const result = await FileSystem.stat(CacheManager.config.baseDir);
    if (!result) {
      throw new Error(`${CacheManager.config.baseDir} not found`);
    }
    return result.size;
  }
  static async isImageCached(entry) {
    try {
      const file = await getCacheEntry(entry);
      const {
        exists
      } = file;
      return exists;
    } catch (e) {
      throw new Error('Error while checking if image already exists on cache');
    }
  }
  static prefetch(source, options) {
    if (typeof source === 'string') {
      CacheManager.get(source, options).getPath();
    } else {
      source.forEach(image => {
        CacheManager.get(image, options).getPath();
      });
    }
  }
  static async prefetchBlob(source, options) {
    const path = await CacheManager.get(source, options).getPath();
    if (path) {
      const blob = await FileSystem.readFile(path, 'base64');
      return blob;
    }
    return undefined;
  }
  static async pruneCache() {
    /* If cache directory does not exist yet there's no need for pruning. */
    if (!(await CacheManager.getCacheSize())) {
      return;
    }
    const files = await FileSystem.statDir(CacheManager.config.baseDir);
    files.sort((a, b) => {
      return a.lastModified - b.lastModified;
    });
    const currentCacheSize = files.reduce((cacheSize, file) => {
      return cacheSize + file.size;
    }, 0);
    if (currentCacheSize > CacheManager.config.cacheLimit) {
      let overflowSize = currentCacheSize - CacheManager.config.cacheLimit;
      while (overflowSize > 0 && files.length) {
        const file = files.shift();
        if (file) {
          if (await FileSystem.exists(file.path)) {
            overflowSize = overflowSize - file.size;
            await FileSystem.unlink(file.path).catch(e => {
              if (__DEV__) {
                console.log(e);
              }
            });
          }
        }
      }
    }
  }
}
const getCacheEntry = async (cacheKey, maxAge) => {
  let newCacheKey = cacheKey;
  if (CacheManager.config.getCustomCacheKey) {
    newCacheKey = CacheManager.config.getCustomCacheKey(cacheKey);
  }
  const filename = cacheKey.substring(cacheKey.lastIndexOf('/'), cacheKey.indexOf('?') === -1 ? cacheKey.length : cacheKey.indexOf('?'));
  const ext = filename.indexOf('.') === -1 ? '.jpg' : filename.substring(filename.lastIndexOf('.'));
  const sha = SHA1(newCacheKey);
  const path = `${CacheManager.config.baseDir}${sha}${ext}`;

  // TODO: maybe we don't have to do this every time
  try {
    await FileSystem.mkdir(CacheManager.config.baseDir);
  } catch (e) {
    /* do nothing */
  }
  const exists = await FileSystem.exists(path);
  if (maxAge && exists) {
    const {
      lastModified
    } = await FileSystem.stat(path);
    const ageInHours = Math.floor(Date.now() - lastModified) / 1000 / 3600;
    if (maxAge < ageInHours) {
      await FileSystem.unlink(path);
      return {
        exists: false,
        path
      };
    }
  }
  return {
    exists,
    path
  };
};
//# sourceMappingURL=CacheManager.js.map