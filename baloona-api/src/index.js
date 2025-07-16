/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		// טיפול בבקשות OPTIONS (preflight)
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': 'https://baloona.pages.dev',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// תשובה רגילה עם CORS
		const response = new Response('Hello World!', {
			headers: {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': 'https://baloona.pages.dev',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
		return response;
	},
};
