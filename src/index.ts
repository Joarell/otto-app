import { WorkerEntrypoint } from 'cloudflare:workers';

type Auth = { response: Response, headers: Headers };

export default class extends WorkerEntrypoint {
	async fetch(request: Request) {
		if (request.method === 'OPTIONS')
			return (await this.env.back.fetch(request));

		const url =			new URL(request.url);
		const authConsult =	await this.authCheck(request);
		const { status } =	authConsult.response;
		const cookies =		Object.fromEntries(request.headers).cookie;
		const routes: string[] = [
			'/api/v1/boot/login',
			'/api/v1/currencies',
			'/api/v1/boot/login',
			'/api/v1/shift/tokens',
			'/api/v1/newEstimate',
			'/api/v1/logout',
			'/api/v1/newEstimate/:ref_id',
			'/api/v1/update/estimates'
		];

		if (routes.includes(url.pathname) && status === 200) {
			const revert =  request.method === "GET" ?
				await this.env.back.fetch(new Request(request.url, {
					method: request.method,
					headers: authConsult.headers
				})): await this.env.back.fetch(new Request(request.url, {
					method: request.method,
					headers: authConsult.headers,
					body: request.body
				}));
			return(revert);
		}
		else if (routes.includes(url.pathname) && status !== 200)
			return(authConsult.response);
		else if (url.pathname.startsWith('/api/v1/login')) {
			const result: Response = cookies ?
				authConsult.response: await this.env.back.fetch(request);

			result.status === 200 ?
				await caches.default.put(url, result.clone()): 0;
			return (result);
		};
		return(await this.appAssets(request, authConsult));
	};

	/**
	* @method returns the app assets.
	* @param request - the client request assests.
	* @param auth - the user authorization for all assests
	*/
	private async appAssets(request: Request, auth: Auth): Promise<Response | undefined> {
		const asset: Response = await this.env.ASSETS.fetch(request);
		const { status } = auth.response;
		const cache = status === 200 && await caches.default.match(request.url);

		if(cache)
			return(await caches.default.match(request.url));
		if (status === 200) {
			await caches.default.put(request, asset.clone());
			return(asset);
		};
		return (status === 200 ? asset: auth.response);
	};

	/**
	* @method executes the authorization API consult.
	* @param request - it has the cookies for authorization checkout.
	*/
	private async authCheck(request: Request): Promise<Auth> {
		const app =		new URL('https://app.ottocratesolver.com');
		const cookies = Object.fromEntries(request.headers).cookie;
		const headers = new Headers();

		headers.set('Cookies', `${cookies}`);
		const auth =	new Request(app, {
			method: request.method,
			headers
		});
		const result = {
			response: await this.env.back.fetch(auth),
			headers,
		}
		return(result);
	};
};
