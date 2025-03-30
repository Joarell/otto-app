import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		const url =	new URL(request.url);
		const app = new URL('https://app.ottocratesolver.com');
		const name: string | null = url.searchParams.get('name');
		const host = url.host === 'app.ottocratesolver.com' || url.host === 'ottocratesolver.com';

		if(name) {
			const checkIn = new Promise(async (resolve, reject) => {
				const user: string | null = await this.env.OTTO_USERS.get(name);
				console.log('NAME:', user);
				user !== null ? resolve(user): reject("Empty");
			});
			const logged = await checkIn;
			return(
				logged !== "Empty" ?
					await this.env.ASSETS.fetch(app):
					new Response("Not found!", { status: 401 })
			);
		}

		if(url.pathname.startsWith('/api/v1/login')) {
			const login: Response = await this.env.back.fetch(request);
			const auth = request.headers.get('Authorization');

			console.log('Basic', auth);
			console.log('STATUS:', login.status);
			return(
				login.status === 200 ?
					new Response(await this.env.ASSETS.fetch(app), { status: 301 }): login
			);
		}
		else if(host) {
			const auth: Response = await this.env.back.fetch(app);
			return(auth.status === 200 ? await this.env.ASSETS.fetch(request): auth);
		}
		return(await this.env.back.fetch(request));
	};
};
