import React, { useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Chip } from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(2),
    background: (props) => {
      if (props.daysLeft <= 1) return "rgba(239, 68, 68, 0.15)";
      if (props.daysLeft <= 3) return "rgba(245, 158, 11, 0.15)";
      return "rgba(34, 197, 94, 0.15)";
    },
    border: (props) => {
      if (props.daysLeft <= 1) return "1px solid rgba(239, 68, 68, 0.4)";
      if (props.daysLeft <= 3) return "1px solid rgba(245, 158, 11, 0.4)";
      return "1px solid rgba(34, 197, 94, 0.4)";
    },
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5, 1),
    },
  },
  icon: {
    fontSize: 16,
    color: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },
  text: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
    whiteSpace: "nowrap",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.7rem",
    },
  },
  badge: {
    fontSize: "0.7rem",
    fontWeight: 600,
    height: 20,
    minWidth: 24,
    padding: "0 6px",
    background: (props) => {
      if (props.daysLeft <= 1) return "#EF4444";
      if (props.daysLeft <= 3) return "#F59E0B";
      return "#22C55E";
    },
    color: "#fff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.65rem",
      height: 18,
      minWidth: 20,
      padding: "0 4px",
    },
  },
}));

const TrialBarNotification = () => {
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const { daysLeft, isExpired, isTrialPeriod } = useMemo(() => {
    if (!user?.company?.dueDate || !user?.company?.createdAt) {
      return { daysLeft: 0, isExpired: true, isTrialPeriod: false };
    }

    const dueDate = moment(user.company.dueDate);
    const createdAt = moment(user.company.createdAt);
    const today = moment();
    const days = dueDate.diff(today, "days");
    const expired = today.isAfter(dueDate);
    
    // Verificar se é período de teste grátis:
    // - Empresa criada há menos de 7 dias
    // - E o dueDate está dentro de 7 dias da criação
    const daysSinceCreation = today.diff(createdAt, "days");
    const daysFromCreationToDue = dueDate.diff(createdAt, "days");
    const isTrial = daysSinceCreation <= 7 && daysFromCreationToDue <= 7;

    return {
      daysLeft: Math.max(0, days),
      isExpired: expired,
      isTrialPeriod: isTrial,
    };
  }, [user?.company?.dueDate, user?.company?.createdAt]);

  const classes = useStyles({ daysLeft });

  // Não mostrar se não for período de teste ou se já expirou
  if (!isTrialPeriod || isExpired) {
    return null;
  }

  const handleClick = () => {
    history.push("/financeiro");
  };

  return (
    <Box className={classes.root} onClick={handleClick}>
      <AccessTimeIcon className={classes.icon} />
      <Typography className={classes.text}>
        Período de Teste
      </Typography>
      <Chip
        label={daysLeft === 0 ? "Hoje" : daysLeft === 1 ? "1 dia" : `${daysLeft} dias`}
        className={classes.badge}
        size="small"
      />
    </Box>
  );
};

export default TrialBarNotification;
