"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPExceptions = exports.HTTPException = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const koa_send_1 = __importDefault(require("koa-send"));
class HTTPException extends Error {
    constructor(statusCode, reason = 'An error has occured.') {
        super(reason);
        this.statusCode = statusCode;
    }
    requestHandler(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.body = this.message;
            ctx.status = this.statusCode;
        });
    }
    ;
}
exports.HTTPException = HTTPException;
class NotFoundException extends HTTPException {
    constructor(reason = 'Couldn\'t find resource.') {
        super(http_status_codes_1.default.NOT_FOUND, reason);
    }
    requestHandler(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.status = this.statusCode;
            ctx.cookies.set('error', this.message, { httpOnly: false });
            yield (0, koa_send_1.default)(ctx, 'src/app/views/404.html');
        });
    }
}
class BadRequestException extends HTTPException {
    constructor(reason = 'Couldn\'t find resource.') {
        super(http_status_codes_1.default.BAD_REQUEST, reason);
    }
}
class Unauthorized extends HTTPException {
    constructor(reason = 'Unauthorized') {
        super(http_status_codes_1.default.UNAUTHORIZED, reason);
    }
}
exports.HTTPExceptions = {
    NotFoundException,
    BadRequestException,
    Unauthorized
};
