import config from 'config';
import Memcached from 'memcached';
import logger from '../log/log';
import { ErrorMsg } from '../model/ErrorMsg';

const memcached = new Memcached(
    config.get<string>('memcached.hosts'),
    {
        'poolSize': config.get<number>('memcached.poolSize'),
    }
);

logger.info('Memcached inited.');

function memcachedGet(code: string): Promise<string | undefined> {
    logger.debug(`try load from memcached ${code}.`);
    return new Promise<string | undefined>((resolve, reject) => {
        memcached.get(code, (err, data) => {
            if (err) {
                logger.error(`Load data from memcached failed with ${code}.`, err);
                reject(ErrorMsg.of(500, 'Internal server error.'));
            } else {
                if (data) {
                    logger.debug(`get from memcached: ${code}`);
                }
                resolve(data);
            }
        });
    });
}

function memcachedSet(key: string, value: string): Promise<boolean> {
    logger.debug(`try set to memcached ${key}.`);
    return new Promise((resolve) => {
        memcached.set(key, value, config.get<number>('memcached.lifetime'), (err, result) => {
            if (err) {
                logger.error(`Set data to memcached failed with ${key}.`, err);
                resolve(false);
            } else {
                if (!result) {
                    logger.warn(`Set data to memcached failed with ${key}.`);
                } else {
                    logger.debug(`set to cache: ${key}`);
                }
                resolve(result);
            }
        });
    });
}

function memcachedRemove(key: string): Promise<boolean> {
    return new Promise((resolve) => {
        memcached.del(key, (err, result) => {
            if (err) {
                logger.error(`Delete data from memcached failed with ${key}.`, err);
                resolve(false);
            } else {
                if (!result) {
                    logger.warn(`Delete data from memcached failed with ${key}.`);
                } else {
                    logger.debug(`remove from cache: ${key}`);
                }
                resolve(result);
            }
        });
    });
}

export { memcached, memcachedGet, memcachedSet, memcachedRemove };