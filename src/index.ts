import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		const app = new URL('https://app.ottocratesolver.com');
		const host = url.host === 'app.ottocratesolver.com' || url.host === 'ottocratesolver.com';

		if(request.method === 'OPTIONS')
			return(await this.env.back.fetch(request));

		if(url.pathname.startsWith('/')) {
			const auth = request.headers.get('Authorization');
			const back: Response = await this.env.back.fetch(request)

			console.log('BEARER', auth);
			console.log('KV-USER', userKV);
			return(back.status === 200 ? await this.env.ASSETS.fetch(request): back);
		};

		if(host) {
			const auth: Response = await this.env.back.fetch(app);
			return(auth.status === 200 ? await this.env.ASSETS.fetch(request): auth);
		};
		return(await this.env.back.fetch(request));
	};
};
