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

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from '@material-ui/core/colors';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import moment from 'moment';

import Rating from '@material-ui/lab/Rating';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	tableContainer: {
		borderRadius: theme.spacing(2),
		border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
		overflow: "hidden",
	},
	table: {
		minWidth: 650,
	},
	tableHead: {
		backgroundColor: theme.palette.type === "dark" 
			? "rgba(255, 255, 255, 0.05)" 
			: "rgba(0, 0, 0, 0.02)",
	},
	tableHeadCell: {
		fontWeight: 600,
		color: theme.palette.text.primary,
		fontSize: "0.875rem",
		textTransform: "uppercase",
		letterSpacing: "0.5px",
	},
	tableRow: {
		"&:hover": {
			backgroundColor: theme.palette.type === "dark" 
				? "rgba(255, 255, 255, 0.05)" 
				: "rgba(0, 0, 0, 0.02)",
		},
		transition: "background-color 0.2s ease",
	},
	tableCell: {
		borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
	},
	on: {
		color: green[500],
		fontSize: '24px'
	},
	off: {
		color: red[500],
		fontSize: '24px'
	},
    pointer: {
        cursor: "pointer"
    },
	emptyState: {
		padding: theme.spacing(4),
		textAlign: "center",
		color: theme.palette.text.secondary,
	}
}));

export function RatingBox ({ rating }) {
    const ratingTrunc = rating === null ? 0 : Math.trunc(rating);
    return <Rating
        defaultValue={ratingTrunc}
        max={3}
        readOnly
    />
}

export default function TableAttendantsStatus(props) {
    const { loading, attendants } = props
	const classes = useStyles();

    function renderList () {
        return attendants.map((a, k) => (
            <TableRow key={k} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>
                    <Typography variant="body2" style={{ fontWeight: 500 }}>
                        {a.name}
                    </Typography>
                </TableCell>
                <TableCell align="center" className={`${classes.tableCell} ${classes.pointer}`} title={i18n.t("dashboard.onlineTable.ratingLabel")}>
                    <RatingBox rating={a.rating} />
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>
                    <Typography variant="body2" color="textSecondary">
                        {formatTime(a.avgSupportTime, 2)}
                    </Typography>
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>
                    { a.online ?
                        <CheckCircleIcon className={classes.on} />
                        : <ErrorIcon className={classes.off} />
                    }
                </TableCell>
            </TableRow>
        ))
    }

	function formatTime(minutes){
		return moment().startOf('day').add(minutes, 'minutes').format('HH[h] mm[m]');
	}

    if (loading) {
        return <Skeleton variant="rect" height={200} style={{ borderRadius: 16 }} />;
    }

    if (!attendants || attendants.length === 0) {
        return (
            <Paper className={classes.tableContainer} elevation={0}>
                <Box className={classes.emptyState}>
                    <Typography variant="body2">
                        Nenhum atendente encontrado
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