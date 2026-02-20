import React from "react";

import Paper from "@material-ui/core/Paper";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Skeleton from "@material-ui/lab/Skeleton";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import LinearProgress from "@material-ui/core/LinearProgress";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import { green, red, grey } from '@material-ui/core/colors';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import StarIcon from '@material-ui/icons/Star';
import moment from 'moment';

import Rating from '@material-ui/lab/Rating';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	tableContainer: {
		borderRadius: theme.spacing(2),
		border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
		overflow: "hidden",
		backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
		boxShadow: theme.palette.type === "dark" 
			? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
			: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
	},
	table: {
		minWidth: 650,
	},
	tableHead: {
		backgroundColor: theme.palette.type === "dark" 
			? "rgba(255, 255, 255, 0.02)" 
			: "rgba(0, 0, 0, 0.01)",
	},
	tableHeadCell: {
		fontWeight: 500,
		color: theme.palette.text.secondary,
		fontSize: "0.75rem",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		padding: theme.spacing(2),
		borderBottom: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
		lineHeight: 1.4,
	},
	tableRow: {
		transition: "background-color 0.2s ease",
		"&:nth-of-type(even)": {
			backgroundColor: theme.palette.type === "dark" 
				? "rgba(255, 255, 255, 0.01)" 
				: "rgba(0, 0, 0, 0.005)",
		},
		"&:hover": {
			backgroundColor: theme.palette.type === "dark" 
				? "rgba(255, 255, 255, 0.05)" 
				: "rgba(0, 0, 0, 0.02)",
		},
	},
	tableCell: {
		borderBottom: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
		padding: theme.spacing(2),
	},
	userCell: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1.5),
	},
	avatar: {
		width: 36,
		height: 36,
		fontSize: "0.85rem",
		fontWeight: 600,
		backgroundColor: theme.palette.primary.main,
	},
	userName: {
		fontWeight: 500,
		fontSize: "0.875rem",
		color: theme.palette.text.primary,
		lineHeight: 1.4,
	},
	userEmail: {
		fontSize: "0.75rem",
		color: theme.palette.text.secondary,
		lineHeight: 1.4,
	},
	statusChip: {
		fontWeight: 500,
		fontSize: "0.75rem",
		height: 24,
		borderRadius: theme.spacing(0.75),
	},
	onlineChip: {
		backgroundColor: "rgba(34, 197, 94, 0.1)",
		color: "#22C55E",
		"& .MuiChip-icon": {
			color: "#22C55E",
		},
	},
	offlineChip: {
		backgroundColor: "rgba(107, 114, 128, 0.1)",
		color: grey[500],
		"& .MuiChip-icon": {
			color: grey[500],
		},
	},
	ratingContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	ratingValue: {
		fontSize: "0.85rem",
		fontWeight: 600,
		color: "#F59E0B",
	},
	timeValue: {
		fontSize: "0.875rem",
		color: theme.palette.text.primary,
		fontWeight: 500,
		lineHeight: 1.4,
	},
	ticketsContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: theme.spacing(0.75),
	},
	ticketsValue: {
		fontSize: "0.875rem",
		fontWeight: 600,
		color: theme.palette.text.primary,
		lineHeight: 1.4,
	},
	progressBar: {
		width: 60,
		height: 4,
		borderRadius: theme.spacing(0.5),
	},
	emptyState: {
		padding: theme.spacing(6),
		textAlign: "center",
		color: theme.palette.text.secondary,
	},
	emptyIcon: {
		fontSize: 48,
		opacity: 0.3,
		marginBottom: theme.spacing(1),
	},
}));

const StyledRating = withStyles({
	iconFilled: {
		color: "#F59E0B",
	},
	iconEmpty: {
		color: "rgba(245, 158, 11, 0.2)",
	},
})(Rating);

const BorderLinearProgress = withStyles((theme) => ({
	root: {
		height: 4,
		borderRadius: 2,
	},
	colorPrimary: {
		backgroundColor: theme.palette.action.hover,
	},
	bar: {
		borderRadius: 2,
		backgroundColor: "#3B82F6",
	},
}))(LinearProgress);

export function RatingBox ({ rating }) {
	const classes = useStyles();
	const ratingTrunc = rating === null ? 0 : Math.trunc(rating);
	return (
		<Box className={classes.ratingContainer}>
			<StyledRating
				value={ratingTrunc}
				max={3}
				readOnly
				size="small"
			/>
			<Typography className={classes.ratingValue}>
				{rating ? rating.toFixed(1) : "0.0"}
			</Typography>
		</Box>
	);
}

const getInitials = (name) => {
	if (!name) return "?";
	const names = name.split(" ");
	if (names.length >= 2) {
		return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
};

export default function TableAttendantsStatus(props) {
	const { loading, attendants } = props;
	const classes = useStyles();

	const maxTickets = Math.max(...attendants.map(a => a.tickets || 0), 1);

	function formatTime(minutes){
		return moment().startOf('day').add(minutes, 'minutes').format('HH[h] mm[m]');
	}

	function renderList () {
		return attendants.map((a, k) => (
			<TableRow key={k} className={classes.tableRow}>
				{/* Nome e Avatar */}
				<TableCell className={classes.tableCell}>
					<Box className={classes.userCell}>
						<Avatar className={classes.avatar}>
							{getInitials(a.name)}
						</Avatar>
						<Box>
							<Typography className={classes.userName}>
								{a.name}
							</Typography>
						</Box>
					</Box>
				</TableCell>

				{/* Avaliação */}
				<TableCell align="center" className={classes.tableCell}>
					<RatingBox rating={a.rating} />
				</TableCell>

				{/* Tickets */}
				<TableCell align="center" className={classes.tableCell}>
					<Box className={classes.ticketsContainer}>
						<Typography className={classes.ticketsValue}>
							{a.tickets || 0}
						</Typography>
						<BorderLinearProgress 
							variant="determinate" 
							value={((a.tickets || 0) / maxTickets) * 100}
							className={classes.progressBar}
						/>
					</Box>
				</TableCell>

				{/* Tempo Médio */}
				<TableCell align="center" className={classes.tableCell}>
					<Typography className={classes.timeValue}>
						{formatTime(a.avgSupportTime)}
					</Typography>
				</TableCell>

				{/* Status Online */}
				<TableCell align="center" className={classes.tableCell}>
					<Chip
						icon={a.online ? <CheckCircleIcon /> : <CancelIcon />}
						label={a.online ? "Online" : "Offline"}
						size="small"
						className={`${classes.statusChip} ${a.online ? classes.onlineChip : classes.offlineChip}`}
					/>
				</TableCell>
			</TableRow>
		))
	}

	if (loading) {
		return <Skeleton variant="rect" height={300} style={{ borderRadius: 16 }} />;
	}

	if (!attendants || attendants.length === 0) {
		return (
			<Paper className={classes.tableContainer} elevation={0}>
				<Box className={classes.emptyState}>
					<Typography className={classes.emptyIcon}>👥</Typography>
					<Typography variant="body1" style={{ fontWeight: 500 }}>
						Nenhum atendente encontrado
					</Typography>
					<Typography variant="body2">
						Os atendentes aparecerão aqui quando houver dados
					</Typography>
				</Box>
			</Paper>
		);
	}

	return (
		<TableContainer component={Paper} className={classes.tableContainer} elevation={0}>
			<Table className={classes.table} aria-label="tabela de atendentes">
				<TableHead className={classes.tableHead}>
					<TableRow>
						<TableCell className={classes.tableHeadCell}>
							{i18n.t("dashboard.onlineTable.name")}
						</TableCell>
						<TableCell align="center" className={classes.tableHeadCell}>
							{i18n.t("dashboard.onlineTable.ratings")}
						</TableCell>
						<TableCell align="center" className={classes.tableHeadCell}>
							Tickets
						</TableCell>
						<TableCell align="center" className={classes.tableHeadCell}>
							{i18n.t("dashboard.onlineTable.avgSupportTime")}
						</TableCell>
						<TableCell align="center" className={classes.tableHeadCell}>
							{i18n.t("dashboard.onlineTable.status")}
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{ renderList() }
				</TableBody>
			</Table>
		</TableContainer>
	)
}
