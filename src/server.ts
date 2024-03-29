import 'dotenv/config';
import Koa from 'koa';
import Router from '@koa/router';
import { bodyParser } from '@koa/bodyparser';
import { HTTPExceptions } from './app/interfaces/http-exception';
import serve from 'koa-static';

import errorHandler from './app/middleware/error-handler';
import { NotificationRouter } from './app/middleware/notification-router';
import cors from '@koa/cors';

const app = new Koa();

const notFoundHandler = new Router();
notFoundHandler.get(/.*/, (ctx: Koa.Context) => {
	throw new HTTPExceptions.NotFoundException(`Endpoint ${ctx.path} doesn't exist.`);
});

async function addVAPIDkey(ctx: Koa.Context, next: Koa.Next) {
	ctx.cookies.set('vapid', process.env['PUBLIC_VAPID_KEY'], {httpOnly: false});
	await next();
}

app.use(cors({allowMethods: ['GET', 'DELETE', 'POST', 'OPTIONS']}));
app.use(errorHandler);
app.use(addVAPIDkey);
app.use(serve('public', {extensions: ['html']}));
app.use(bodyParser());
app.use(NotificationRouter.routes());
app.use(NotificationRouter.allowedMethods())
app.use(notFoundHandler.routes());

app.listen(8000);
console.log('Server is running on http://127.0.0.1:8000');
