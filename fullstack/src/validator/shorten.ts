import { ErrorMsg } from "../model/ErrorMsg";

const MAX_URL_LENGTH = 2048;

function validate(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!url) {
            reject(ErrorMsg.of(400, 'Please input a url.'));
        } else if (!isValidLength(url)) {
            reject(ErrorMsg.of(400, `Url exceeds max size ${MAX_URL_LENGTH}.`));
        } else if (!isValidUrl(url)) {
            reject(ErrorMsg.of(400, `Please input a valid url.`));
        } else {
            resolve(url);
        }
    });
}

function isValidLength(s: string) {
    if (s.length > MAX_URL_LENGTH) {
        return false;
    }

    return true;
}

function isValidUrl(s: string) {
    try {
        const url = new URL(s);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

export { validate, isValidLength, isValidUrl };