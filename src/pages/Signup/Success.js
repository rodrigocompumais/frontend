import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Container } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background:
      "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  content: {
    background:
      "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    borderRadius: 24,
    padding: theme.spacing(6),
    textAlign: "center",
    maxWidth: 560,
    width: "100%",
    border: "1px solid rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  icon: {
    fontSize: 100,
    color: "#22C55E",
    marginBottom: theme.spacing(3),
    filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2.2rem",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #FFFFFF 0%, #22C55E 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("sm")]: { fontSize: "1.7rem" },
  },
  message: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.05rem",
    color: "rgba(226, 232, 240, 0.85)",
    marginBottom: theme.spacing(4),
    lineHeight: 1.7,
  },
  button: {
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
    padding: theme.spacing(1.5, 5),
    borderRadius: 12,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(0, 217, 255, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #00E5FF, #2DD881)",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(0, 217, 255, 0.4)",
    },
    transition: "all 0.3s ease",
  },
}));

const SignupSuccess = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Box className={classes.content}>
          <CheckCircleIcon className={classes.icon} />

          <Typography className={classes.title}>
            Conta Criada com Sucesso!
          </Typography>

          <Typography className={classes.message}>
            Seu pagamento foi confirmado e sua conta já está ativa. Faça login
            para começar a usar o sistema e transformar seu atendimento.
          </Typography>

          <Button
            className={classes.button}
            variant="contained"
            onClick={() => history.push("/login")}
          >
            Acessar o Sistema
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupSuccess;
