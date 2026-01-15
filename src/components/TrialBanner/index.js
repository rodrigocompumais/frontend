import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles, Box, Typography, Button, IconButton } from "@material-ui/core";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CloseIcon from "@material-ui/icons/Close";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import useTrialPeriod from "../../hooks/useTrialPeriod";

const useStyles = makeStyles((theme) => ({
  banner: {
    width: "100%",
    padding: theme.spacing(1.5, 2),
    background: (props) => {
      if (props.daysLeft <= 1) {
        return "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))";
      }
      if (props.daysLeft <= 3) {
        return "linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))";
      }
      return "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))";
    },
    color: "#FFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    position: "relative",
    zIndex: theme.zIndex.appBar - 1,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 1.5),
      flexDirection: "column",
      gap: theme.spacing(1),
    },
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flex: 1,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  icon: {
    fontSize: 24,
    color: "#FFF",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.25),
    [theme.breakpoints.down("sm")]: {
      flex: 1,
    },
  },
  title: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#FFF",
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "'Inter', sans-serif",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      justifyContent: "flex-end",
    },
  },
  button: {
    padding: theme.spacing(0.75, 2),
    borderRadius: 8,
    fontSize: "0.85rem",
    fontWeight: 600,
    textTransform: "none",
    background: "rgba(255, 255, 255, 0.2)",
    color: "#FFF",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.3)",
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5, 1.5),
      fontSize: "0.8rem",
    },
  },
  closeButton: {
    color: "#FFF",
    padding: theme.spacing(0.5),
    "&:hover": {
      background: "rgba(255, 255, 255, 0.1)",
    },
  },
  badge: {
    padding: theme.spacing(0.25, 1),
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.25)",
    fontSize: "0.75rem",
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    whiteSpace: "nowrap",
  },
}));

const TrialBanner = () => {
  const { isInTrialPeriod, daysLeft, isExpired, daysSinceCreation } = useTrialPeriod();
  const [dismissed, setDismissed] = React.useState(false);

  const classes = useStyles({ daysLeft });

  // Verificar se foi fechado no localStorage
  React.useEffect(() => {
    const dismissedKey = `trialBanner_dismissed_${daysLeft}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    if (wasDismissed === "true") {
      setDismissed(true);
    }
  }, [daysLeft]);

  const handleDismiss = () => {
    setDismissed(true);
    const dismissedKey = `trialBanner_dismissed_${daysLeft}`;
    localStorage.setItem(dismissedKey, "true");
  };

  // Não mostrar se não estiver no período de teste, se expirou ou se foi fechado
  if (!isInTrialPeriod || isExpired || dismissed) {
    return null;
  }

  const getMessage = () => {
    if (daysLeft === 0) {
      return "Seu período de teste expira hoje!";
    }
    if (daysLeft === 1) {
      return "Seu período de teste expira amanhã!";
    }
    if (daysSinceCreation && daysSinceCreation <= 7) {
      return `Você está no período de teste grátis. ${daysLeft} dias restantes.`;
    }
    return `Seu período de teste expira em ${daysLeft} dias.`;
  };

  return (
    <Box className={classes.banner}>
      <Box className={classes.content}>
        <AccessTimeIcon className={classes.icon} />
        <Box className={classes.textContainer}>
          <Typography className={classes.title}>Período de Teste</Typography>
          <Typography className={classes.subtitle}>{getMessage()}</Typography>
        </Box>
        <Box className={classes.badge}>{daysLeft} dias</Box>
      </Box>
      <Box className={classes.actions}>
        <Button
          component={RouterLink}
          to="/financeiro"
          className={classes.button}
          endIcon={<ArrowForwardIcon />}
        >
          Assinar Agora
        </Button>
        <IconButton
          size="small"
          className={classes.closeButton}
          onClick={handleDismiss}
          aria-label="Fechar banner"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TrialBanner;
