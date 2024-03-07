const publicKey = 'BC5Vrvd09F2PS8s4QHUcRKlYbP4Z0Nstdy2hmbq5PgBbZWfu6mvV9kDsMY-HCE39r2L2tsbctU_lX73f48ZCmhw';

/**
 * @param {string} formId
 * @param {[string, function?]} fields
 */
function processForm(formId, ...fields) {
	const form = document.getElementById(formId);

	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	const data = new FormData(form);
	const notification = {
		title: data.get('title'),
		options: {
			body: data.get('body'),
			vibrate: JSON.parse(`[${data.get('vibrate')}]`)
		}
	};

	const options = fields.reduce((accumulator, field) => {
		const [name, parser] = field;
		const fieldData = data.get(name);
		return {...accumulator, [name]: parser ? parser(fieldData) : fieldData};
	}, {})

	requestNotification(notification, options);
}

async function getPushSubscription() {
	const swRegistration = await navigator.serviceWorker.getRegistration();
	return await swRegistration.pushManager.subscribe({
		applicationServerKey: publicKey,
		userVisibleOnly: true
	});
}

async function requestNotification(notification, options) {
	options ||= {};
	const subscription = await getPushSubscription();
	const httpBody = {notification, subscription, ...options};

	const headers = new Headers({'Content-Type': 'application/json'});
	const response = await fetch(location.href, {body: JSON.stringify(httpBody), method: 'POST', headers});

	const successEl = document.getElementById('success');
	const errorEl = document.getElementById('error');
	if (response.ok) {
		if (successEl) successEl.innerHTML = 'Successfully requested notification.'
		if (errorEl) errorEl.innerHTML = '';
		return;
	}
	if (errorEl) errorEl.innerHTML = await response.text();
	if (successEl) successEl.innerHTML = '';
}
