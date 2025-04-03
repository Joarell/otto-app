import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		const app =	new URL('https://app.ottocratesolver.com');
		const { headers } = request;

		if(request.method === 'OPTIONS')
			return(await this.env.back.fetch(request));

		console.log(headers);
		if(url.pathname.startsWith('/api/v1/login'))
			return(await this.env.back.fetch(request));
		const checkIn: Response = await this.env.back.fetch(app);
		return(checkIn.ok ? await this.env.ASSETS.fetch(request): checkIn);
	};
};
