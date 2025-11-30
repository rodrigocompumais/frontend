import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Container, CircularProgress } from "@material-ui/core";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: theme.spacing(3),
  },
  content: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: theme.spacing(4),
    textAlign: "center",
    maxWidth: 500,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    fontSize: 80,
    color: "#ff9800",
    marginBottom: theme.spacing(2),
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2rem",
    color: "#1a202c",
    marginBottom: theme.spacing(2),
  },
  message: {
    fontSize: "1.1rem",
    color: "#4a5568",
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
  },
  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: theme.spacing(1.5, 4),
    borderRadius: 12,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    "&:hover": {
      background: "linear-gradient(135deg, #5568d3 0%, #653a91 100%)",
    },
  },
  loading: {
    marginBottom: theme.spacing(2),
  },
}));

const SignupPending = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box className={classes.container}>
      <Container>
        <Box className={classes.content}>
          <CircularProgress className={classes.loading} size={60} />
          <HourglassEmptyIcon className={classes.icon} />
          <Typography className={classes.title}>
            Pagamento em Processamento
          </Typography>
          <Typography className={classes.message}>
            Seu pagamento está sendo processado pelo Mercado Pago. Isso pode
            levar alguns minutos. Sua empresa será criada automaticamente assim
            que o pagamento for confirmado. Você receberá um email quando tudo
            estiver pronto.
          </Typography>
          <Button
            className={classes.button}
            variant="contained"
            onClick={() => history.push("/login")}
          >
            Ir para Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupPending;

