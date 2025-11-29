import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
} from "@material-ui/core";
import WarningAmberIcon from "@material-ui/icons/Warning";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { AuthContext } from "../../context/Auth/AuthContext";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
    padding: theme.spacing(3),
  },
  card: {
    maxWidth: 520,
    width: "100%",
    borderRadius: 24,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    backdropFilter: "blur(20px)",
    overflow: "hidden",
    position: "relative",
  },
  cardHeader: {
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
    borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))",
    border: "2px solid rgba(239, 68, 68, 0.4)",
    marginBottom: theme.spacing(2),
    animation: "$pulse 2s infinite",
  },
  warningIcon: {
    fontSize: 40,
    color: "#EF4444",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.75rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    color: "rgba(148, 163, 184, 0.9)",
    lineHeight: 1.6,
  },
  cardContent: {
    padding: theme.spacing(4),
  },
  infoBox: {
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: 12,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(3),
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  infoLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.8rem",
    color: "rgba(148, 163, 184, 0.7)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: theme.spacing(0.5),
  },
  infoValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#F9FAFB",
  },
  expiredDate: {
    color: "#EF4444",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  primaryButton: {
    padding: "14px 24px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "linear-gradient(135deg, #22C55E, #16A34A)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)",
      background: "linear-gradient(135deg, #2DD881, #22C55E)",
    },
  },
  secondaryButton: {
    padding: "14px 24px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "transparent",
    color: "#F9FAFB",
    border: "1px solid rgba(0, 217, 255, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(0, 217, 255, 0.1)",
      borderColor: "#00D9FF",
    },
  },
  logoutButton: {
    padding: "12px 24px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "0.9rem",
    textTransform: "none",
    color: "rgba(148, 163, 184, 0.8)",
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#F9FAFB",
      background: "rgba(255, 255, 255, 0.05)",
    },
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    margin: theme.spacing(2, 0),
    color: "rgba(148, 163, 184, 0.5)",
    fontSize: "0.85rem",
    "&::before, &::after": {
      content: '""',
      flex: 1,
      height: 1,
      background: "rgba(148, 163, 184, 0.2)",
    },
  },
  footer: {
    padding: theme.spacing(3),
    borderTop: "1px solid rgba(148, 163, 184, 0.1)",
    textAlign: "center",
  },
  footerText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.85rem",
    color: "rgba(148, 163, 184, 0.7)",
    lineHeight: 1.6,
  },
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)",
    },
    "70%": {
      boxShadow: "0 0 0 15px rgba(239, 68, 68, 0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)",
    },
  },
}));

const SubscriptionExpired = () => {
  const classes = useStyles();
  const { user, handleLogout } = useContext(AuthContext);

  const companyName = user?.company?.name || "Sua empresa";
  const planName = user?.company?.plan?.name || "Plano";
  const dueDate = user?.company?.dueDate;
  const formattedDate = dueDate ? moment(dueDate).format("DD/MM/YYYY") : "-";

  const handleContactWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Minha assinatura do plano *${planName}* da empresa *${companyName}* expirou em ${formattedDate}.\n\nGostaria de renovar meu acesso. Podem me ajudar?`
    );
    window.open(`https://wa.me/553433511861?text=${message}`, "_blank");
  };

  const handleViewPlans = () => {
    window.location.href = "/#planos";
  };

  return (
    <Box className={classes.root}>
      <Paper className={classes.card} elevation={0}>
        {/* Header */}
        <Box className={classes.cardHeader}>
          <Box className={classes.iconWrapper}>
            <WarningAmberIcon className={classes.warningIcon} />
          </Box>
          <Typography className={classes.title}>
            Período de Teste Encerrado
          </Typography>
          <Typography className={classes.subtitle}>
            Seu período de teste gratuito expirou. Renove sua assinatura para continuar utilizando todos os recursos.
          </Typography>
        </Box>

        {/* Content */}
        <Box className={classes.cardContent}>
          {/* Info boxes */}
          <Box className={classes.infoBox}>
            <Typography className={classes.infoLabel}>Empresa</Typography>
            <Typography className={classes.infoValue}>{companyName}</Typography>
          </Box>

          <Box className={classes.infoBox}>
            <Typography className={classes.infoLabel}>Plano Testado</Typography>
            <Typography className={classes.infoValue}>{planName}</Typography>
          </Box>

          <Box className={classes.infoBox}>
            <Typography className={classes.infoLabel}>Data de Vencimento</Typography>
            <Typography className={`${classes.infoValue} ${classes.expiredDate}`}>
              {formattedDate}
            </Typography>
          </Box>

          {/* Actions */}
          <Box className={classes.actions}>
            <Button
              className={classes.primaryButton}
              startIcon={<WhatsAppIcon />}
              onClick={handleContactWhatsApp}
              fullWidth
            >
              Renovar via WhatsApp
            </Button>

            <Button
              className={classes.secondaryButton}
              startIcon={<RefreshIcon />}
              onClick={handleViewPlans}
              fullWidth
            >
              Ver Planos Disponíveis
            </Button>

            <Box className={classes.divider}>ou</Box>

            <Button
              className={classes.logoutButton}
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              fullWidth
            >
              Sair da conta
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box className={classes.footer}>
          <Typography className={classes.footerText}>
            Precisa de ajuda? Entre em contato conosco pelo WhatsApp e renove sua assinatura em minutos.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubscriptionExpired;

