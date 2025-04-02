import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =		new URL(request.url);
		const app =		new URL('https://app.ottocratesolver.com')

		// return(await this.env.ASSETS.fetch(request));
		if(request.method === 'OPTIONS')
			return(await this.env.back.fetch(request));

		if(url.pathname.startsWith('/')) {
			const back: Response = await this.env.back.fetch(request)
			console.log('BACK root:', back.status);
			return(back.status === 200 ? await this.env.ASSETS.fetch(request): back);
		}
		// else if(url.pathname.startsWith('/api/v1/login')) {
		// 	const logged: Response = await this.env.back.fetch(request);
		// 	return(logged.status <= 308 ? await this.env.ASSETS.fetch(app): logged);
		// };
		return(await this.env.back.fetch(request));
	};
};
