import { Agenda } from '@hokify/agenda';
import webpush from 'web-push';
import { Notification } from '../interfaces/notification';
import { DetailedPushSubscription } from '../middleware/notification-router';
import { ObjectId } from 'mongodb';

if (!process.env.DATABASE) {
	console.error('No database has been configured in your enviroment variables. Quitting application...');
	process.exit();
}

const agenda = new Agenda({db: {address: process.env.DATABASE as string}, ensureIndex: true});
webpush.setVapidDetails('mailto:dev@noahvisser.com', process.env['PUBLIC_VAPID_KEY'] as string, process.env['PRIVATE_VAPID_KEY'] as string);

agenda.define('send notification', async job => {
	const notification = job.attrs.data.notification as Notification;
	const subscription = job.attrs.data.subscription as DetailedPushSubscription;

	if (subscription.expirationTime && Date.now() > subscription.expirationTime) {
		await job.remove();
		return;
	}

	await webpush.sendNotification(subscription, JSON.stringify(notification));
});

agenda.processEvery('1 minute');
agenda.start().then(() => console.log('Tasks are running...'));

export async function cronNotification(notification: Notification, subscription: DetailedPushSubscription, cron: string) {
	return await agenda.create('send notification', {notification, subscription}).repeatEvery(cron).save();
}

export async function scheduledNotification(notification: Notification, subscription: DetailedPushSubscription, date: Date) {
	return await agenda.schedule(date, 'send notification', {notification, subscription});
}

export async function sendNotification(notification: Notification, subscription: DetailedPushSubscription) {
	return await agenda.now('send notification', {notification, subscription});
}

export async function deleteNotification(id: string) {
	const _id = ObjectId.createFromHexString(id);
	return await agenda.cancel({_id});
}
