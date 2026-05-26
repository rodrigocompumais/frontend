import React from "react";
import { Container, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  paragraph: {
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.7,
  },
}));

const PrivacyPolicy = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <Typography variant="h4" className={classes.title}>
          Politica de Privacidade
        </Typography>

        <Typography className={classes.paragraph}>
          Esta Politica de Privacidade descreve como os dados pessoais sao coletados,
          utilizados e protegidos no uso do aplicativo.
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          1. Dados coletados
        </Typography>
        <Typography className={classes.paragraph}>
          Podemos coletar dados de cadastro, contato, mensagens e informacoes de uso
          estritamente necessarias para funcionamento da plataforma.
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          2. Finalidade do uso
        </Typography>
        <Typography className={classes.paragraph}>
          Os dados sao utilizados para operacao do atendimento, seguranca, suporte,
          melhorias do servico e cumprimento de obrigacoes legais.
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          3. Compartilhamento
        </Typography>
        <Typography className={classes.paragraph}>
          Os dados nao sao comercializados e somente podem ser compartilhados quando
          necessario para execucao do servico, por obrigacao legal ou mediante
          solicitacao do titular, conforme legislacao aplicavel.
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          4. Seguranca e retencao
        </Typography>
        <Typography className={classes.paragraph}>
          Aplicamos medidas tecnicas e administrativas para proteger as informacoes e
          retemos os dados pelo periodo necessario para as finalidades previstas.
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          5. Direitos do titular
        </Typography>
        <Typography className={classes.paragraph}>
          O titular pode solicitar confirmacao de tratamento, acesso, correcao,
          anonimização, exclusao ou portabilidade dos dados, nos limites legais.
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          6. Contato
        </Typography>
        <Typography className={classes.paragraph}>
          Para duvidas sobre privacidade ou exercicio de direitos, entre em contato
          com o responsavel pela plataforma.
        </Typography>

        <Typography variant="body2" color="textSecondary">
          Ultima atualizacao: 29/04/2026
        </Typography>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
