import Koa from 'koa';
import send from 'koa-send';
import { HTTPException } from '../interfaces/http-exception';
import HttpStatus from 'http-status-codes';

export default async function errorHandler(ctx: Koa.Context, next: Koa.Next) {
	try {
		await next();
	} catch (err: any) {
		if (err instanceof HTTPException) {
			await err.requestHandler(ctx);
			return;
		}
		console.error(err);
		ctx.body = 'Something went wrong on the server. This is probably not your fault.';
		ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
	}
}
