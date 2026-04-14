import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { versionSystem } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { nomeEmpresa } from "../../../package.json";
import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logo.png";
import {LanguageOutlined} from "@material-ui/icons";
import {
	IconButton,
	Menu,
	MenuItem,
	FormControlLabel,
	Checkbox,
	ListItemText,
	ListSubheader,
} from "@material-ui/core";
import LanguageControl from "../../components/LanguageControl";
import ParticlesBackground from "../../components/ParticlesBackground";
import {
	loadRememberedCredentialsList,
	isRememberCredentialsSupported,
} from "../../helpers/loginRememberedCredentials";


const Copyright = () => {
	return (
		<Typography variant="body2" color="primary" align="center">
			{"Copyright "}
 			<Link color="primary" href="#">
 				{ nomeEmpresa } - v { versionSystem }
 			</Link>{" "}
 			{new Date().getFullYear()}
 			{"."}
 		</Typography>
 	);
 };

const useStyles = makeStyles(theme => ({
	root: {
		width: "100vw",
		height: "100vh",
		background:
			"radial-gradient(circle at top, #1E293B 0%, #020617 55%, #000000 100%)",
		backgroundRepeat: "no-repeat",
		backgroundSize: "100% 100%",
		backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		position: "relative"
	},
	paper: {
		backgroundColor: theme.palette.login,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "55px 30px",
		borderRadius: "12.5px",
	},
	avatar: {
		margin: theme.spacing(1),  
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	powered: {
		color: "white"
	},
	languageControl: {
		position: "absolute",
		top: 0,
		left: 0,
		paddingLeft: 15
	}
}));

const Login = () => {
	const classes = useStyles();

	const [user, setUser] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [savedMenuAnchor, setSavedMenuAnchor] = useState(null);
	const [savedAccounts, setSavedAccounts] = useState([]);

	const rememberSupported = isRememberCredentialsSupported();

	// Languages
	const [anchorElLanguage, setAnchorElLanguage] = useState(null);
	const [menuLanguageOpen, setMenuLanguageOpen] = useState(false);

	const { handleLogin } = useContext(AuthContext);

	useEffect(() => {
		if (!rememberSupported) return;
		let cancelled = false;
		loadRememberedCredentialsList().then(list => {
			if (!cancelled) {
				setSavedAccounts(list);
				if (list.length > 0) {
					const lastUsed = list[list.length - 1];
					setUser(prev => ({
						...prev,
						email: lastUsed.email || "",
						password: lastUsed.password || "",
					}));
					setRememberMe(true);
				}
			}
		});
		return () => {
			cancelled = true;
		};
	}, [rememberSupported]);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handlSubmit = e => {
		e.preventDefault();
		handleLogin({ ...user, rememberMe: rememberSupported && rememberMe });
	};

	const handleEmailFieldClick = async event => {
		if (!rememberSupported) return;
		const list = await loadRememberedCredentialsList();
		setSavedAccounts(list);
		if (list.length > 0) {
			setSavedMenuAnchor(event.currentTarget);
		}
	};

	const handlePickSavedAccount = entry => {
		setUser({ email: entry.email, password: entry.password });
		setSavedMenuAnchor(null);
	};

	const handlemenuLanguage = ( event ) => {
		setAnchorElLanguage(event.currentTarget);
		setMenuLanguageOpen( true );
	}

	const handleCloseMenuLanguage = (  ) => {
		setAnchorElLanguage(null);
		setMenuLanguageOpen(false);
	}
	
	return (
		<div className={classes.root}>
		<ParticlesBackground />
		<div className={classes.languageControl}>
			<IconButton edge="start">
				<LanguageOutlined
					aria-label="account of current user"
					aria-controls="menu-appbar"
					aria-haspopup="true"
					onClick={handlemenuLanguage}
					variant="contained"
					style={{ color: "white",marginRight:10 }}
				/>
			</IconButton>
			<Menu
				id="menu-appbar-language"
				anchorEl={anchorElLanguage}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuLanguageOpen}
				onClose={handleCloseMenuLanguage}
			>
				<MenuItem>
					<LanguageControl />
				</MenuItem>
			</Menu>
		</div>
		<Container component="main" maxWidth="xs">
			<CssBaseline/>
			<div className={classes.paper}>
				<div>
					<img style={{ margin: "0 auto", width: "70%" }} src={logo} alt="Whats" />
				</div>
				{/*<Typography component="h1" variant="h5">
					{i18n.t("login.title")}
				</Typography>*/}
				<form className={classes.form} noValidate onSubmit={handlSubmit}>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label={i18n.t("login.form.email")}
						name="email"
						value={user.email}
						onChange={handleChangeInput}
						onClick={handleEmailFieldClick}
						autoComplete="email"
						autoFocus
						inputProps={{
							"aria-haspopup": savedAccounts.length > 0 ? "listbox" : undefined,
							"aria-expanded": Boolean(savedMenuAnchor),
						}}
					/>
					<Menu
						anchorEl={savedMenuAnchor}
						open={Boolean(savedMenuAnchor) && savedAccounts.length > 0}
						onClose={() => setSavedMenuAnchor(null)}
						anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
						transformOrigin={{ vertical: "top", horizontal: "left" }}
						getContentAnchorEl={null}
						PaperProps={{
							style: {
								minWidth: savedMenuAnchor ? savedMenuAnchor.offsetWidth : undefined,
								maxHeight: 280,
							},
						}}
					>
						<ListSubheader component="div" disableSticky>
							{i18n.t("login.form.savedAccountsMenuTitle")}
						</ListSubheader>
						{savedAccounts.map(acc => (
							<MenuItem
								key={acc.email}
								dense
								onClick={() => handlePickSavedAccount(acc)}
							>
								<ListItemText
									primary={acc.email}
									secondary={i18n.t("login.form.savedEncryptedHint")}
								/>
							</MenuItem>
						))}
					</Menu>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label={i18n.t("login.form.password")}
						type={showPassword ? "text" : "password"}
						id="password"
						value={user.password}
						onChange={handleChangeInput}
						autoComplete="current-password"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
										onClick={() => setShowPassword((prev) => !prev)}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<FormControlLabel
						control={
							<Checkbox
								checked={rememberMe}
								onChange={e => setRememberMe(e.target.checked)}
								color="primary"
								disabled={!rememberSupported}
							/>
						}
						label={
							<span>
								{i18n.t("login.form.rememberMe")}
								{!rememberSupported && (
									<Typography
										component="span"
										variant="caption"
										color="textSecondary"
										display="block"
									>
										{i18n.t("login.form.rememberMeUnsupported")}
									</Typography>
								)}
							</span>
						}
						style={{ width: "100%", alignItems: "center", marginTop: 4, marginBottom: 0 }}
					/>
					
					{/* <Grid container justify="flex-end">
					  <Grid item xs={6} style={{ textAlign: "right" }}>
						<Link component={RouterLink} to="/forgetpsw" variant="body2">
						  Esqueceu sua senha?
						</Link>
					  </Grid>
					</Grid>*/}
					
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
					>
						{i18n.t("login.buttons.submit")}
					</Button>
					{ <Grid container>
						<Grid item>
							<Link
								href="#"
								variant="body2"
								component={RouterLink}
								to="/signup"
							>
								{i18n.t("login.buttons.register")}
							</Link>
						</Grid>
					</Grid> }
				</form>
			
			</div>
			<Box mt={8}><Copyright /></Box>
		</Container>
		</div>
	);
};

export default Login;
