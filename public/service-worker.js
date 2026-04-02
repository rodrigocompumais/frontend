// Service Worker (PWA). v3: não intercepta API em outro domínio; HTML em rede primeiro.
const CACHE_NAME = "compuchat-v3";
const urlsToCache = ["/", "/static/css/main.css", "/static/js/main.js"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(urlsToCache))
			.catch((err) => {
				console.log("Erro ao cachear recursos:", err);
			})
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) =>
			Promise.all(
				cacheNames.map((name) => {
					if (name !== CACHE_NAME) {
						return caches.delete(name);
					}
					return null;
				})
			)
		)
	);
});

self.addEventListener("fetch", (event) => {
	const req = event.request;
	const url = new URL(req.url);
	// API em outro host (backend): não usar cache do SW
	if (url.origin !== self.location.origin) {
		return;
	}
	// HTML: priorizar rede para pegar o index.html atualizado (chunks com hash novo)
	if (req.mode === "navigate") {
		event.respondWith(
			fetch(req).catch(() => caches.match("/"))
		);
		return;
	}
	event.respondWith(
		caches.match(req).then((response) => response || fetch(req))
	);
});
