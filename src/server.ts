import 'dotenv/config';
import Koa from 'koa';
import Router from '@koa/router';
import { bodyParser } from '@koa/bodyparser';
import { HTTPExceptions } from './app/exception';
import serve from 'koa-static';

import errorHandler from './app/middleware/error-handler';
import { NotificationController } from './app/controllers/notification-controller';

const app = new Koa();

const notFoundHandler = new Router();
notFoundHandler.get(/.*/, (ctx: Koa.Context) => {
	throw new HTTPExceptions.NotFoundException(`Endpoint ${ctx.path} doesn't exist.`);
});

app.use(errorHandler);
app.use(serve('./src/public', {extensions: ['html']}));
app.use(bodyParser());
app.use(NotificationController.routes());
app.use(notFoundHandler.routes());

app.listen(8000);
console.log('Server is running on http://127.0.0.1:8000');
