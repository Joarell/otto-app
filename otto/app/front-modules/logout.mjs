function cleanCacheSW() {
	globalThis.navigator.serviceWorker.ready.then(async (registration) => {
		await caches.delete("craterCache_v1");
		await caches.delete("status_V1");
		await caches.delete("pane1_v1");
		await caches.delete("pane2_v1");
		await registration.unregister();
	});
	return;
}

export async function logout() {
	/**
	 * @constant {url}
	 */
	const url = "/api/v1/logout";

	if (confirm("Are you sure to logout?")) {
		await fetch(url, { method: "GET" })
			.then(cleanCacheSW)
			.then((res) => globalThis.location.assign(res.url))
			.catch(async () => {
				await Promise.resolve(cleanCacheSW).then(
					globalThis.location.replace("https://ottocratesolver.com/login"),
				);
			});
	}
}

export async function forceLogout() {
	const url = "/api/v1/logout";

	await fetch(url, { method: "GET" })
		.then(cleanCacheSW)
		.then((res) => globalThis.location.assign(res.url))
		.catch(async () => {
			await Promise.resolve(cleanCacheSW).then(
				globalThis.location.replace("https://ottocratesolver.com/login"),
			);
		});
}
