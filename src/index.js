import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

// Desativa SW legado e limpa caches antigos para evitar ficar preso
// em versões antigas do frontend (problema de precisar Ctrl+F5).
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.getRegistrations()
			.then((registrations) => {
				return Promise.all(registrations.map((registration) => registration.unregister()));
			})
			.then(async () => {
				if ('caches' in window) {
					const keys = await caches.keys();
					await Promise.all(keys.map((key) => caches.delete(key)));
				}
			})
			.catch((error) => {
				console.log('Erro ao limpar Service Worker/cache legado:', error);
			});
	});
}

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root")
);

// ReactDOM.render(
// 	<React.StrictMode>
// 		<CssBaseline>
// 			<App />
// 		</CssBaseline>,
//   </React.StrictMode>

// 	document.getElementById("root")
// );
