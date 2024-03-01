import { Agenda } from '@hokify/agenda';
import webpush, { PushSubscription } from 'web-push';
import { Notification } from '../interfaces/notification';
import { DetailedPushSubscription } from '../controllers/notification-controller';

if (!process.env.DATABASE && process.env.ENVIRONMENT !== 'development') {
	console.error('No database has been configured in your enviroment variables. Quitting application...');
	process.exit();
}

const agenda = new Agenda({db: {address: process.env.DATABASE as string}, ensureIndex: true});

agenda.define('send notification', async job => {
	const notification = job.attrs.data.notification as Notification;
	const subscription = job.attrs.data.subscription as DetailedPushSubscription;

	if (subscription.expirationTime && Date.now() > subscription.expirationTime) {
		await job.remove();
		return;
	}

	await webpush.sendNotification(subscription, JSON.stringify(notification));
});

agenda.start().then(r => console.log('Tasks are running...'));

export function cronNotification(notification: Notification, subscription: DetailedPushSubscription, cron: string) {
	agenda.every(cron, 'send notification', {notification, subscription});
}

export function scheduledNotification(notification: Notification, subscription: DetailedPushSubscription, date: Date) {
	agenda.schedule(date, 'send notification', {notification, subscription});
}

export function sendNotification(notification: Notification, subscription: DetailedPushSubscription) {
	agenda.now('send notification', {notification, subscription});
}
