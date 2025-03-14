function cleanCacheSW () {
	globalThis.navigator.serviceWorker.ready.then(async registration => {
		await caches.delete('craterCache_v1');
		await caches.delete('status_V1');
		await caches.delete('pane1_v1');
		await caches.delete('pane2_v1');
		await registration.unregister();
	});
	return;
}


export async function logout() {
	const url = '/logout';
	const cookies = "id=deleted; sessin=deleted; name=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT";

	if (confirm("Are you sure to logout?")) {
		await fetch(url, {
			method: "GET",
			cookie: cookies,
			headers: { 'Content-Type': 'application/json; charset=UTF-8' },
		}).then(cleanCacheSW).then(res => globalThis.location.assign(res.url))
		.catch(async () => {
			await Promise.resolve(cleanCacheSW)
			.then(globalThis.location.replace("https://ottocratesolver.com/login"));
		});
	}
};


export async function forceLogout() {
	const url = '/logout';
	const cookies = "id=deleted; sessin=deleted; name=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT";

	await fetch(url, {
		method: "GET",
		cookie: cookies,
		headers: { 'Content-Type': 'application/json; charset=UTF-8' },
	}).then(cleanCacheSW).then(res => globalThis.location.assign(res.url))
	.catch(async () => {
		await Promise.resolve(cleanCacheSW)
		.then(globalThis.location.replace("https://ottocratesolver.com/login"));
	});
};
