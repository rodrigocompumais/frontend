import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";
import moment from "moment";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, isPublic = false, allowExpired = false, ...rest }) => {
	const { isAuth, loading, user } = useContext(AuthContext);

	// Verificar se a assinatura está vencida
	const isSubscriptionExpired = () => {
		if (!user?.company?.dueDate) return false;
		const dueDate = moment(user.company.dueDate);
		const today = moment();
		return today.isAfter(dueDate);
	};

	// Se não está autenticado e a rota é privada
	if (!isAuth && isPrivate) {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
			</>
		);
	}

	// Se está autenticado e a rota não é privada (ex: login, signup)
	// Redireciona para página de expiração, ou para a função do usuário (defaultRoute), ou dashboard
	if (isAuth && !isPrivate && !isPublic) {
		let redirectPath = "/dashboard";
		if (isSubscriptionExpired()) {
			redirectPath = "/subscription-expired";
		} else if (user?.defaultRoute) {
			const route = typeof user.defaultRoute === "string" ? user.defaultRoute.trim() : "";
			const allowed = ["dashboard", "tickets", "cozinha", "entregador", "garcom", "pedidos", "mesas", "forms", "lanchonetes", "pdv"];
			if (route && allowed.includes(route)) {
				redirectPath = `/${route}`;
			}
		}
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: redirectPath, state: { from: rest.location } }} />
			</>
		);
	}

	// Se está autenticado, rota é privada, assinatura expirada e não permite expirado
	if (isAuth && isPrivate && isSubscriptionExpired() && !allowExpired) {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/subscription-expired", state: { from: rest.location } }} />
			</>
		);
	}

	return (
		<>
			{loading && <BackdropLoading />}
			<RouterRoute {...rest} component={Component} />
		</>
	);
};

export default Route;
