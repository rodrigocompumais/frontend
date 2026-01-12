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
	// MAS SOMENTE se não for uma rota pública (permite acesso mesmo estando autenticado)
	// Redireciona para dashboard ou para página de expiração
	if (isAuth && !isPrivate && !isPublic) {
		const redirectPath = isSubscriptionExpired() ? "/subscription-expired" : "/dashboard";
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
