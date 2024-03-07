if ('serviceWorker' in navigator) {
	registerServiceWorker();
}

async function registerServiceWorker() {
	const register = await navigator.serviceWorker.register('/sw.js');
}
