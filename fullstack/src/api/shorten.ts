import { generateHash, pickFirst, pickAll } from '../core/core';
import { mysqlGet, mysqlGetMultiInfo, mysqlInsert } from '../database/mysql';
import { memcachedGet, memcachedRemove } from '../database/memcached';
import { validate } from '../validator/shorten';
import logger from '../log/log';
import { ErrorMsg } from '../model/ErrorMsg';

function shorten (url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        validate(url)
        .then((url) => {
            return shortenUrl(url);
        })
        .then((code) => {
            resolve(code);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function shortenUrl(url: string): Promise<string> {
    const now: number = Date.now();
    const hash: string = generateHash(url);
    const first: string = pickFirst(hash);
    return new Promise<string>((resolve, reject) => {
        tryGetOrigin(first)
        .then((origin) => {
            if (origin) {
                if (url == origin) {
                    return first;
                } else {
                    return undefined;
                }
            } else {
                return tryInsertDb(first, url, now);
            }
        })
        .then((code) => {
            if (!code) {
                return tryPickAnother(hash, url, now);
            } else {
                return code;
            }
        })
        .then((code) => {
            resolve(code);
        })
        .catch((err: ErrorMsg) => {
            reject(err);
        });
    });
}

function tryGetOrigin(code: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        memcachedGet(code)
        .then((origin: string | undefined) => {
            if (origin == '') {
                return undefined;
            } else if (origin == undefined) {
                return mysqlGet(code);
            }
            return origin;
        })
        .then((origin: string | undefined) => {
            resolve(origin);
        })
        .catch((err: ErrorMsg) => {
            reject(err);
        });
    });
}

function tryInsertDb(code: string, url: string, now: number): Promise<string | undefined> {
    logger.debug(`tryInsertDb: ${code}`);
    return new Promise<string | undefined>((resolve, reject) => {
        mysqlInsert(code, url, now)
        .then((code: string | undefined) => {
            if (code) {
                memcachedRemove(code);
            }
            resolve(code);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function tryPickAnother(hash: string, url: string, now: number): Promise<string> {
    const all: string[] = pickAll(hash);
    let infos: any[] = [];
    return new Promise<string>((resolve, reject) => {
        mysqlGetMultiInfo(all)
        .then((results) => {
                infos = results;
                for (const info of infos) {
                    if (url == info['origin_url']) {
                        return info['short_url'];
                    }
                }
                return doPickAnother(url, now, all, infos);
        })
        .then((code) => {
            if (code) {
                resolve(code);
            } else {
                reject(ErrorMsg.of(500, `Failed to shorten url: ${url}.`));
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function doPickAnother(url: string, now: number, all: string[], infos: any[]): Promise<string | undefined> {
    const codes: string[] = infos.map((info) => info['short_url']);
    const set: Set<string> = new Set(codes);
    const unused: any[] = all.filter((code) => !set.has(code));
    return new Promise<string | undefined>(async (resolve, reject) => {
        try {
            for (const code of unused) {
                const result = await tryInsertDb(code, url, now);
                if (result) {
                    resolve(result);
                    return;
                }
            }
            resolve(undefined);
        } catch (err) {
            reject(err);
        }
    });
}

export { shortenUrl, tryInsertDb, tryPickAnother, doPickAnother };
export default shorten;