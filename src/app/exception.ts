import HttpStatus from 'http-status-codes';
import Koa from 'koa';
import send from 'koa-send';

export abstract class Exception extends Error {
	public readonly statusCode: number;

	public constructor(statusCode: number, reason: string = 'An error has occured.') {
		super(reason);
		this.statusCode = statusCode;
	}

	public async requestHandler(ctx: Koa.Context): Promise<void> {
		ctx.body = super.message;
		ctx.status = this.statusCode;
	};
}

class NotFoundException extends Exception {
	constructor(reason: string = 'Couldn\'t find resource.') {
		super(HttpStatus.NOT_FOUND, reason);
	}

	public async requestHandler(ctx: Koa.Context): Promise<void> {
		ctx.status = this.statusCode;
		ctx.cookies.set('error', this.message, {httpOnly: false});
		await send(ctx, 'src/app/views/404.html');
	}
}

class BadRequestException extends Exception {
	constructor(reason: string = 'Couldn\'t find resource.') {
		super(HttpStatus.BAD_REQUEST, reason);
	}
}

export const HTTPExceptions = {
	NotFoundException,
	BadRequestException
};
