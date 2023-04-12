import { Request, Response, Router } from 'express';
import unshorten from './unshorten';
import shorten from './shorten';
import logger from '../log/log';
import { ErrorMsg } from '../model/ErrorMsg';

const router = Router();
router.get('/favicon.ico', (_, res: Response) => res.sendStatus(204).end());

router.get('/:code', (req: Request, res: Response) => {
    unshorten(req.params.code)
    .then((url) => {
        res.status(200).send({'url': url}).end();
    })
    .catch((err: ErrorMsg) => {
        logger.debug('Unshorten failed.', err);
        res.status(err.httpStatus).send({'msg': err.message}).end();
    });
});
router.post('/shorten', (req: Request, res: Response) => {
    shorten(req.body?.url)
    .then((code) => {
        res.status(200).send({'code': code}).end();
    })
    .catch((err: ErrorMsg) => {
        logger.info('Shorten failed.', err);
        res.status(err.httpStatus).send({'msg': err.message}).end();
    });
});

export default router;