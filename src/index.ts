import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =		new URL(request.url);
		const app =		new URL('https://app.ottocratesolver.com');
		const user =	JSON.parse(await this.env.OTTO_USERS.get('Pass'));

		if (request.method === 'OPTIONS')
			return (await this.env.back.fetch(request));

		if (url.pathname.startsWith('/api/v1/login')) {
			const auth: Response = await this.env.back.fetch(request);
			await caches.default.put(url, auth.clone());
			return (auth);
		};

		console.log('THE PASS:', user);
		const checkIn: Response =	await this.env.back.fetch(app);
		const asset: Response =		await this.env.ASSETS.fetch(request);

		if (user) {
			const headers: Headers = new Headers(asset.headers);

			headers.append('set-cookie', `__Secure-Name=${user.userName}; max-age=28800; HttpOnly; SameSite=Strict; Path=/; Secure; Domain=ottocratesolver.com`);
			headers.append('set-cookie',`__Secure-RefToken=${user.refToken}; max-age=3600; HttpOnly; SameSite=Strict; Path=/; Secure; Domain=ottocratesolver.com`);
			headers.append('set-cookie',`__Secure-Session-ID=${user.session}; max-age=28800; HttpOnly; SameSite=Strict; Path=/; Secure; Domain=ottocratesolver.com`,);
			headers.append('set-cookie',`__Secure-Access=${user.access}; max-age=28800; HttpOnly; SameSite=Strict; Path=/; Secure; Domain=ottocratesolver.com`,);

			const response = new Response(asset.body, {
				status: asset.status,
				headers
			});
			return(response);
		};
		return (checkIn.status === 200 ? asset: checkIn);
	};
};
