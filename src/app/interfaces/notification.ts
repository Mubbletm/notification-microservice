interface NotificationAction {
	action: string,
	title: string,
	icon: string
}

interface NotificationOptions {
	/** @experimental */
	actions?: NotificationAction[],
	/** @experimental */
	badge?: string,
	/** @experimental */
	image?: string,
	icon?: string,
	body?: string,
	/** @experimental */
	data?: any,
	dir?: 'auto' | 'ltr' | 'rtl',
	lang?: string,
	/** @experimental */
	requireInteraction?: boolean,
	/** @experimental */
	renotify?: boolean,
	tag?: string,
	silent?: boolean,
	timestamp?: number,
	/** @experimental */
	vibrate?: number[]
}

export interface Notification {
	title: string,
	options?: NotificationOptions
}
