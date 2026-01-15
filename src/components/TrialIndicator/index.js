import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, LinearProgress } from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import useTrialPeriod from "../../hooks/useTrialPeriod";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1.5),
    margin: theme.spacing(1),
    borderRadius: 12,
    background: (props) => {
      if (props.daysLeft <= 1) return "rgba(239, 68, 68, 0.1)";
      if (props.daysLeft <= 3) return "rgba(245, 158, 11, 0.1)";
      return "rgba(34, 197, 94, 0.1)";
    },
    border: (props) => {
      if (props.daysLeft <= 1) return "1px solid rgba(239, 68, 68, 0.3)";
      if (props.daysLeft <= 3) return "1px solid rgba(245, 158, 11, 0.3)";
      return "1px solid rgba(34, 197, 94, 0.3)";
    },
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "block",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  rootCollapsed: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5),
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: (props) => {
      if (props.daysLeft <= 1) return "rgba(239, 68, 68, 0.1)";
      if (props.daysLeft <= 3) return "rgba(245, 158, 11, 0.1)";
      return "rgba(34, 197, 94, 0.1)";
    },
    border: (props) => {
      if (props.daysLeft <= 1) return "1px solid rgba(239, 68, 68, 0.3)";
      if (props.daysLeft <= 3) return "1px solid rgba(245, 158, 11, 0.3)";
      return "1px solid rgba(34, 197, 94, 0.3)";
    },
    cursor: "pointer",
    textDecoration: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  icon: {
    fontSize: 18,
    color: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
  },
  iconCollapsed: {
    fontSize: 20,
    color: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
  },
  label: {
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
  },
  daysText: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    "& .MuiLinearProgress-bar": {
      borderRadius: 2,
      background: (props) => {
        if (props.daysLeft <= 1) return "linear-gradient(90deg, #EF4444, #DC2626)";
        if (props.daysLeft <= 3) return "linear-gradient(90deg, #F59E0B, #D97706)";
        return "linear-gradient(90deg, #22C55E, #16A34A)";
      },
    },
  },
  badge: {
    fontSize: "0.65rem",
    padding: "2px 6px",
    borderRadius: 10,
    fontWeight: 600,
    background: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
    color: "#fff",
  },
}));

const TrialIndicator = ({ collapsed = false }) => {
  const { isInTrialPeriod, daysLeft, isExpired } = useTrialPeriod();

  const classes = useStyles({ daysLeft });

  // Progresso baseado em 7 dias de teste
  const progressValue = isExpired ? 0 : Math.min(100, (daysLeft / 7) * 100);

  // Não mostrar se não for período de teste ou se já expirou
  if (!isInTrialPeriod || isExpired) {
    return null;
  }

  // Versão colapsada (só ícone)
  if (collapsed) {
    return (
      <Box
        component={RouterLink}
        to="/financeiro"
        className={classes.rootCollapsed}
        title={`${daysLeft} dias restantes`}
      >
        <Box className={classes.badge}>{daysLeft}</Box>
      </Box>
    );
  }

  // Versão expandida
  return (
    <Box
      component={RouterLink}
      to="/financeiro"
      className={classes.root}
    >
      <Box className={classes.header}>
        <AccessTimeIcon className={classes.icon} />
        <Typography className={classes.label}>
          Período de Teste
        </Typography>
      </Box>
      
      <Typography className={classes.daysText}>
        {daysLeft === 0
          ? "Último dia!"
          : daysLeft === 1
          ? "1 dia restante"
          : `${daysLeft} dias restantes`}
      </Typography>
      
      <LinearProgress
        variant="determinate"
        value={progressValue}
        className={classes.progressBar}
      />
    </Box>
  );
};

export default TrialIndicator;

