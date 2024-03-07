import Router from '@koa/router';
import {
	cronNotification,
	deleteNotification,
	scheduledNotification,
	sendNotification
} from '../services/notification-service';
import { PushSubscription } from 'web-push';
import { HTTPExceptions } from '../interfaces/http-exception';
import { Notification } from '../interfaces/notification';
import Cron from 'cron-validate';
import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';

export interface DetailedPushSubscription extends PushSubscription {
	expirationTime: DOMHighResTimeStamp
}

export const NotificationRouter = new Router();

NotificationRouter.post('/now', ctx => {
	const notification: Notification = ctx.request.body.notification;
	const subscription: DetailedPushSubscription = ctx.request.body.subscription;

	validateNotification(notification);
	validatePushSubscription(subscription);

	console.log(`Pushing requested notification...`);

	sendNotification(notification, subscription);
	ctx.status = HttpStatus.OK;
})

NotificationRouter.post('/schedule', ctx => {
	const notification: Notification = ctx.request.body.notification;
	const subscription: DetailedPushSubscription = ctx.request.body.subscription;
	const dateString: string = ctx.request.body.date;

	validateNotification(notification);
	validatePushSubscription(subscription);
	validateDate(dateString);

	console.log(`Scheduling new notification for: ${new Date(dateString)}`);

	scheduledNotification(notification, subscription, new Date(dateString));
	ctx.status = HttpStatus.OK;
});

NotificationRouter.post('/cron', async ctx => {
	const notification: Notification = ctx.request.body.notification;
	const subscription: DetailedPushSubscription = ctx.request.body.subscription;
	const cron: string = ctx.request.body.cron;

	validateNotification(notification);
	validatePushSubscription(subscription);
	validateCron(cron);

	console.log(`Scheduling new notification with the following cron: ${cron}`);

	const job = await cronNotification(notification, subscription, cron);
	ctx.body = signJWT(job.attrs._id?.toHexString() as string);
	ctx.status = HttpStatus.OK;
});

NotificationRouter.delete('/cron', async ctx => {
	const jwt = ctx.request.headers['job-jwt'] as string;
	console.log(jwt);
	if (!jwt) throw new HTTPExceptions.BadRequestException('Missing JWT token.');
	let hexString;
	try {
		hexString  = verifyJWT(jwt);
	} catch (e) {
		throw new HTTPExceptions.Unauthorized('An invalid JWT token was provided.');
	}
	await deleteNotification(hexString as string);
	ctx.status = HttpStatus.OK;
	ctx.body = `Successfully deleted notification with id: ${hexString}`;
});

function validateCron(cron: string) {
	if (!cron) throw new HTTPExceptions.BadRequestException('Missing cron field in body.');
	const cronResult = Cron(cron);
	if (cronResult.isError()) throw new HTTPExceptions.BadRequestException(`Something is wrong with the submitted cron:\n\t${cronResult.getError().join('\n')}`);
}

function validateDate(date: string) {
	if (!date) throw new HTTPExceptions.BadRequestException('Missing date field in body.');
	if (isNaN(Date.parse(date))) throw new HTTPExceptions.BadRequestException('An invalid date was submitted in the body.');
}

function validateNotification(notification: Notification) {
	if (!notification) throw new HTTPExceptions.BadRequestException('Missing notification field in body.');
	if (!notification.title) throw new HTTPExceptions.BadRequestException('Missing notification.title field in body.');
}

function validatePushSubscription(subscription: DetailedPushSubscription) {
	if (!subscription) throw new HTTPExceptions.BadRequestException('Missing subscription field in body.');
	if (!subscription.endpoint) throw new HTTPExceptions.BadRequestException('Missing subscription.endpoint field in body.');
	if (!subscription.keys.auth) throw new HTTPExceptions.BadRequestException('Missing subscription.keys.auth field in body.');
	if (!subscription.keys.p256dh) throw new HTTPExceptions.BadRequestException('Missing subscription.keys.p256dh field in body.');
	// if (subscription.expirationTime !== undefined) throw new HTTPExceptions.BadRequestException('Missing subscription.expirationTime field in body.');
}

function signJWT(o: string | Buffer | Object, expiresIn?: number) {
	return jwt.sign(o, process.env.JWT_SECRET as string, expiresIn ? {expiresIn} : undefined);
}

function verifyJWT(JWT: string) {
	return jwt.verify(JWT, process.env.JWT_SECRET as string)
}
