import React, { createContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import useWhatsApps from "../../hooks/useWhatsApps";
import { i18n } from "../../translate/i18n";

const WhatsAppsContext = createContext();

const ALERT_STATUSES = new Set(["TIMEOUT", "DISCONNECTED", "PENDING"]);
const HEALTHY_PREV_STATUSES = new Set(["CONNECTED", "OPENING"]);

const WhatsAppsProvider = ({ children }) => {
	const { loading, whatsApps } = useWhatsApps();
	const prevStatusByIdRef = useRef({});
	const lastToastKeyRef = useRef({});
	const recoveringIdsRef = useRef(new Set());
	const initializedRef = useRef(false);

	useEffect(() => {
		if (!Array.isArray(whatsApps)) {
			return;
		}

		// Primeira carga: só registra status, sem toast (evita spam ao abrir o app).
		if (!initializedRef.current) {
			const initial = {};
			whatsApps.forEach((w) => {
				if (w?.id != null) {
					initial[w.id] = w.status;
					if (ALERT_STATUSES.has(w.status)) {
						recoveringIdsRef.current.add(w.id);
					}
				}
			});
			prevStatusByIdRef.current = initial;
			initializedRef.current = true;
			return;
		}

		const prev = prevStatusByIdRef.current;
		const next = { ...prev };

		whatsApps.forEach((whatsApp) => {
			if (whatsApp?.id == null) return;

			const id = whatsApp.id;
			const name = whatsApp.name || `#${id}`;
			const newStatus = whatsApp.status;
			const oldStatus = prev[id];

			next[id] = newStatus;

			if (!oldStatus || oldStatus === newStatus) {
				return;
			}

			const toastKey = `${id}:${newStatus}`;
			if (lastToastKeyRef.current[id] === toastKey) {
				return;
			}

			if (
				HEALTHY_PREV_STATUSES.has(oldStatus) &&
				ALERT_STATUSES.has(newStatus)
			) {
				recoveringIdsRef.current.add(id);
				lastToastKeyRef.current[id] = toastKey;
				if (newStatus === "PENDING") {
					toast.warn(
						i18n.t("connections.toasts.pending", { name }),
						{ toastId: toastKey }
					);
				} else if (newStatus === "DISCONNECTED") {
					toast.warn(
						i18n.t("connections.toasts.sessionEnded", { name }),
						{ toastId: toastKey }
					);
				} else {
					toast.warn(
						i18n.t("connections.toasts.disconnected", { name }),
						{ toastId: toastKey }
					);
				}
				return;
			}

			// TIMEOUT/PENDING/DISCONNECTED → OPENING → CONNECTED: avisar só no CONNECTED.
			if (
				newStatus === "CONNECTED" &&
				recoveringIdsRef.current.has(id)
			) {
				recoveringIdsRef.current.delete(id);
				lastToastKeyRef.current[id] = toastKey;
				toast.success(
					i18n.t("connections.toasts.reconnected", { name }),
					{ toastId: toastKey }
				);
			}
		});

		prevStatusByIdRef.current = next;
	}, [whatsApps]);

	return (
		<WhatsAppsContext.Provider value={{ whatsApps, loading }}>
			{children}
		</WhatsAppsContext.Provider>
	);
};

export { WhatsAppsContext, WhatsAppsProvider };
