import { memcachedGet, memcachedSet } from '../database/memcached';
import { mysqlGet } from '../database/mysql';
import { ErrorMsg } from '../model/ErrorMsg';
import { validate } from '../validator/unshorten';
import logger from '../log/log';

function unshorten(code: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        validate(code)
        .then((code) => {
            return tryFetchOrigin(code)
        })
        .then((origin) => {
            if (origin) {
                resolve(origin);
            } else {
                reject(ErrorMsg.of(404, `Short url: ${code} is not found.`));
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function tryFetchOrigin(code: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        memcachedGet(code)
        .then((origin) => {
            if (origin == undefined) {
                return tryGetFromDb(code);
            } else {
                return origin;
            }
        })
        .then((origin) => {
            resolve(origin);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

 function tryGetFromDb(code: string): Promise<string | undefined> {
    logger.debug(`try tryGetFromDb: ${code}`);
    return new Promise<string | undefined>((resolve, reject) => {
        mysqlGet(code)
        .then((origin) => {
            if (origin) {
                memcachedSet(code, origin);
                resolve(origin);
            } else {
                memcachedSet(code, '');
                resolve(undefined);
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export { tryFetchOrigin, tryGetFromDb };
export default unshorten;