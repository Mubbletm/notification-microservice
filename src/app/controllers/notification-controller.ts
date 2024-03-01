import Router from '@koa/router';
import { cronNotification, scheduledNotification, sendNotification } from '../services/notification-service';
import { PushSubscription } from 'web-push';
import { HTTPExceptions } from '../exception';
import { Notification } from '../interfaces/notification';
import Cron from 'cron-validate';

export interface DetailedPushSubscription extends PushSubscription {
	expirationTime: DOMHighResTimeStamp
}

export const NotificationController = new Router({
	prefix: '/notification'
});

NotificationController.post('/now', ctx => {
	const notification: Notification = ctx.request.body.notification;
	const subscription: DetailedPushSubscription = ctx.request.body.subscription;

	validateNotification(notification);
	validatePushSubscription(subscription);

	sendNotification(notification, subscription);
})

NotificationController.post('/schedule', ctx => {
	const notification: Notification = ctx.request.body.notification;
	const subscription: DetailedPushSubscription = ctx.request.body.subscription;
	const dateString: string = ctx.request.body.date;

	validateNotification(notification);
	validatePushSubscription(subscription);
	validateDate(dateString);

	scheduledNotification(notification, subscription, new Date(dateString));
});

NotificationController.post('/cron', ctx => {
	const notification: Notification = ctx.request.body.notification;
	const subscription: DetailedPushSubscription = ctx.request.body.subscription;
	const cron: string = ctx.request.body.cron;

	validateNotification(notification);
	validatePushSubscription(subscription);
	validateCron(cron);

	cronNotification(notification, subscription, cron);
});

function validateCron(cron: string) {
	if (!cron) throw new HTTPExceptions.BadRequestException('Missing cron field in body.');
	const cronResult = Cron(cron);
	if (cronResult.isError()) throw new HTTPExceptions.BadRequestException(`Something is wrong with the submitted cron:\n${cronResult.getError().join('\n')}`);
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
	if (subscription.expirationTime !== undefined) throw new HTTPExceptions.BadRequestException('Missing subscription.expirationTime field in body.');
}
