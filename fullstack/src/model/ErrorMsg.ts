export class ErrorMsg {
    public httpStatus: number;
    public message: string;

    constructor(httpStatus: number, message: string) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    static of(httpStatus: number, message: string): ErrorMsg {
        return new ErrorMsg(httpStatus, message);
    }
}