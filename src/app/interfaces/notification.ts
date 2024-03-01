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
export class Notification {
	public readonly title: string;
	public get options(): NotificationOptions { return JSON.parse(JSON.stringify(this._options)); };

	constructor(title: string, options: NotificationOptions = {}) {
		this.title = title;
		this._options = options;
	}

	private readonly _options: NotificationOptions;

	public toJSON() {
		return JSON.stringify({
			title: this.title,
			options: this.options
		});
	}
}

