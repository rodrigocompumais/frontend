import React, { useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@material-ui/core";

import ChatIcon from "@material-ui/icons/Chat";
import PeopleIcon from "@material-ui/icons/People";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import TimelineIcon from "@material-ui/icons/Timeline";
import ExtensionIcon from "@material-ui/icons/Extension";
import ScheduleIcon from "@material-ui/icons/Schedule";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import ScrollReveal from "scrollreveal";

import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import ParticlesBackground from "../../components/ParticlesBackground";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background:
      "radial-gradient(circle at top, #1E293B 0%, #020617 55%, #000000 100%)",
    color: "#F9FAFB",
    position: "relative",
    overflow: "hidden",
  },
  hero: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
  },
  logo: {
    width: 180,
    marginBottom: theme.spacing(3),
  },
  heroTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: "#F9FAFB",
  },
  heroSubtitle: {
    marginBottom: theme.spacing(4),
    color: "rgba(226, 232, 240, 0.8)",
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  heroImage: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    boxShadow: theme.shadows[6],
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.4)",
  },
  section: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  sectionTitle: {
    marginBottom: theme.spacing(4),
    fontWeight: 600,
    textAlign: "center",
    color: "#E5E7EB",
  },
  cardGrid: {
    marginTop: theme.spacing(2),
  },
  featureCard: {
    height: "100%",
    borderRadius: 16,
    boxShadow: theme.shadows[5],
    background: "rgba(15, 23, 42, 0.95)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    color: "#E5E7EB",
    backdropFilter: "blur(10px)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[8],
      borderColor: "rgba(94, 234, 212, 0.8)",
    },
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    background:
      "linear-gradient(135deg, #22C55E, #4ADE80)",
    color: "#fff",
  },
  ctaSection: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    background:
      "linear-gradient(135deg, #0EA5E9 0%, #22C55E 50%, #0F172A 100%)",
  },
  footer: {
    marginTop: "auto",
    padding: theme.spacing(4, 0),
    textAlign: "center",
    color: "rgba(148, 163, 184, 0.9)",
  },
}));

const Landing = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const sr = ScrollReveal({
      distance: "40px",
      duration: 800,
      easing: "ease-out",
      origin: "bottom",
      reset: false,
    });

    sr.reveal(".sr-hero", { delay: 200 });
    sr.reveal(".sr-section-title", { delay: 150 });
    sr.reveal(".sr-card", { interval: 120 });

    return () => {
      sr.destroy();
    };
  }, []);

  return (
    <div className={classes.root}>
      <ParticlesBackground />
      <Container maxWidth="lg" className={`${classes.hero} sr-hero`}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <img src={logo} alt="Logo" className={classes.logo} />
            <Typography variant={isSmall ? "h4" : "h3"} className={classes.heroTitle}>
              CRM de atendimento via WhatsApp com chatbot e time multiusuário.
            </Typography>
            <Typography variant="h6" className={classes.heroSubtitle}>
              Centralize conversas, automatize atendimentos com IA, gerencie múltiplas
              contas de WhatsApp e tenha visão completa do seu funil em um único lugar.
            </Typography>
            <Box className={classes.heroActions}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                color="primary"
                size="large"
              >
                Começar agora
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="primary"
                size="large"
              >
                Já sou cliente
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="center">
              <Box
                className={classes.heroImage}
                p={3}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Visão consolidada do atendimento:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Tickets em tempo real<br />
                  • Conversas em múltiplas filas e setores<br />
                  • Performance da equipe em dashboards intuitivos<br />
                  • Integração com automações e chatbots inteligentes
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box className={classes.section}>
        <Container maxWidth="lg">
          <Typography variant="h4" className={`${classes.sectionTitle} sr-section-title`}>
            Tudo que você precisa para um atendimento moderno
          </Typography>
          <Grid container spacing={4} className={classes.cardGrid}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ChatIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    CRM de chat interno
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Organize conversas, tickets e histórico completo de cada cliente
                    em um único painel de atendimento.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <PeopleIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Multiusuários & times
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Vários atendentes trabalhando ao mesmo tempo, com filas, filas
                    de espera e distribuição inteligente de tickets.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <WhatsAppIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Múltiplas contas WhatsApp
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Conecte diversas contas de WhatsApp em um só lugar e gerencie
                    todas as conversas com visão unificada.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <FlashOnIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Campanhas em massa
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Crie campanhas com disparos em massa, filtros de contatos e
                    acompanhamento de resultados em tempo real.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box className={classes.section}>
        <Container maxWidth="lg">
          <Typography variant="h4" className={`${classes.sectionTitle} sr-section-title`}>
            Integrações poderosas para ir além
          </Typography>
          <Grid container spacing={4} className={classes.cardGrid}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ExtensionIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    OpenAI & chatbots inteligentes
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Use inteligência artificial para responder de forma rápida e
                    personalizada, integrando com OpenAI e outras plataformas.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ExtensionIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Dialogflow, N8N, Webhooks, Typebot
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Conecte seus fluxos favoritos para montar jornadas completas
                    de atendimento e automação de ponta a ponta.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <TimelineIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Flowbuilder visual
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Desenhe fluxos de atendimento com blocos visuais, menus,
                    perguntas e respostas automatizadas de forma intuitiva.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box className={classes.section}>
        <Container maxWidth="lg">
          <Typography variant="h4" className={`${classes.sectionTitle} sr-section-title`}>
            Gestão completa: do contato ao resultado
          </Typography>
          <Grid container spacing={4} className={classes.cardGrid}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ScheduleIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Agendamento de disparos
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Programe campanhas e mensagens para os melhores horários e
                    aumente a taxa de resposta dos seus contatos.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ViewColumnIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    CRM Kanban
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Organize oportunidades e atendimentos em colunas Kanban,
                    acompanhando cada etapa do funil de forma visual.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <AssignmentTurnedInIcon />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Tarefas & dashboards
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Acompanhe tarefas da equipe e monitore indicadores-chave em
                    dashboards pensados para gestão.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box className={classes.ctaSection}>
        <Container maxWidth="sm">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            style={{ color: "#fff", fontWeight: 600 }}
          >
            Pronto para elevar o seu atendimento?
          </Typography>
          <Typography
            variant="body1"
            align="center"
            paragraph
            style={{ color: "#E3F2FD" }}
          >
            Comece agora a centralizar seu atendimento via WhatsApp, automatizar
            processos e ter mais controle sobre os resultados do seu time.
          </Typography>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              color="default"
              size="large"
            >
              Criar minha conta
            </Button>
          </Box>
        </Container>
      </Box>

      <Box className={classes.footer}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Atendimento WhatsApp CRM. Todos os direitos
          reservados.
        </Typography>
      </Box>
    </div>
  );
};

export default Landing;


