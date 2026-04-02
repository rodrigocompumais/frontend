import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js')
			.then((registration) => {
				console.log('Service Worker registrado com sucesso:', registration.scope);
				registration.update();
				setInterval(() => registration.update(), 60 * 60 * 1000);
			})
			.catch((error) => {
				console.log('Erro ao registrar Service Worker:', error);
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
