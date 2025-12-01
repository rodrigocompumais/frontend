import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Container } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
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
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    borderRadius: 24,
    padding: theme.spacing(5),
    textAlign: "center",
    maxWidth: 600,
    border: "1px solid rgba(239, 68, 68, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    position: "relative",
    zIndex: 1,
  },
  icon: {
    fontSize: 100,
    color: "#EF4444",
    marginBottom: theme.spacing(3),
    filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2.5rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #FFFFFF 0%, #EF4444 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2rem",
    },
  },
  message: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.1rem",
    color: "rgba(226, 232, 240, 0.85)",
    marginBottom: theme.spacing(4),
    lineHeight: 1.7,
  },
  buttonContainer: {
    display: "flex",
    gap: theme.spacing(2),
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
    padding: theme.spacing(1.5, 4),
    borderRadius: 12,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(0, 217, 255, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #00E5FF, #2DD881)",
      boxShadow: "0 6px 20px rgba(0, 217, 255, 0.4)",
      transform: "translateY(-2px)",
    },
    transition: "all 0.3s ease",
  },
  buttonSecondary: {
    background: "transparent",
    color: "#00D9FF",
    padding: theme.spacing(1.5, 4),
    borderRadius: 12,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    border: "2px solid rgba(0, 217, 255, 0.5)",
    "&:hover": {
      background: "rgba(0, 217, 255, 0.1)",
      borderColor: "#00D9FF",
    },
    transition: "all 0.3s ease",
  },
}));

const SignupFailure = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Box className={classes.content}>
          <ErrorIcon className={classes.icon} />
          <Typography className={classes.title}>
            Pagamento Não Aprovado
          </Typography>
          <Typography className={classes.message}>
            Infelizmente, seu pagamento não foi aprovado. Verifique os dados do
            cartão ou tente com outro método de pagamento.
          </Typography>
          <Box className={classes.buttonContainer}>
            <Button
              className={classes.button}
              variant="contained"
              onClick={() => history.push("/signup")}
            >
              Tentar Novamente
            </Button>
            <Button
              className={classes.buttonSecondary}
              variant="outlined"
              onClick={() => history.push("/")}
            >
              Voltar ao Início
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupFailure;

