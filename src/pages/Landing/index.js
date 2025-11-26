import React, { useEffect, useState } from "react";

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
  Chip,
  CircularProgress,
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
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import StarIcon from "@material-ui/icons/Star";
import ScrollReveal from "scrollreveal";

import { Link as RouterLink } from "react-router-dom";
import ParticlesBackground from "../../components/ParticlesBackground";
import api from "../../services/api";

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
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(10),
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
  // Estilos para seção de planos
  plansSection: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(2, 6, 23, 0.8) 100%)",
  },
  planCard: {
    height: "100%",
    borderRadius: 20,
    background: "linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    color: "#E5E7EB",
    backdropFilter: "blur(12px)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-8px) scale(1.02)",
      boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.25)",
      borderColor: "rgba(14, 165, 233, 0.6)",
    },
  },
  planCardFeatured: {
    border: "2px solid #22C55E",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: "linear-gradient(90deg, #22C55E, #4ADE80)",
    },
  },
  planCardContent: {
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  planName: {
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(1),
    color: "#F9FAFB",
  },
  planPrice: {
    marginBottom: theme.spacing(3),
  },
  planPriceValue: {
    fontSize: "2.5rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #0EA5E9, #22C55E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  planPriceMonth: {
    fontSize: "1rem",
    color: "rgba(148, 163, 184, 0.9)",
  },
  planFeaturesList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    marginBottom: theme.spacing(3),
    flexGrow: 1,
  },
  planFeatureItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    color: "rgba(226, 232, 240, 0.9)",
    fontSize: "0.95rem",
  },
  planFeatureIcon: {
    color: "#22C55E",
    fontSize: "1.2rem",
  },
  planFeatureDisabled: {
    color: "rgba(100, 116, 139, 0.6)",
    textDecoration: "line-through",
  },
  planCta: {
    marginTop: "auto",
    padding: theme.spacing(1.5, 4),
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "linear-gradient(135deg, #0EA5E9, #22C55E)",
    color: "#fff",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #0284C7, #16A34A)",
      transform: "scale(1.05)",
      boxShadow: "0 10px 30px -10px rgba(14, 165, 233, 0.5)",
    },
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "linear-gradient(135deg, #22C55E, #4ADE80)",
    color: "#fff",
    fontWeight: 600,
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
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6),
  },
}));

const Landing = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Fetch planos da API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get("/plans/list");
        setPlans(data);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

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
    sr.reveal(".sr-plan-card", { interval: 150 });

    return () => {
      sr.destroy();
    };
  }, []);

  // Função para redirecionar para WhatsApp com mensagem pré-definida
  const handleAcquirePlan = (plan) => {
    const features = [];
    if (plan.users) features.push(`${plan.users} usuário(s)`);
    if (plan.connections) features.push(`${plan.connections} conexão(ões) WhatsApp`);
    if (plan.queues) features.push(`${plan.queues} fila(s)`);

    const message = encodeURIComponent(
      `Olá! Tenho interesse no plano *${plan.name}* - R$ ${plan.value?.toFixed(2)}/mês.\n\nRecursos: ${features.join(", ")}.\n\nGostaria de mais informações!`
    );
    window.open(`https://wa.me/553433511861?text=${message}`, "_blank");
  };

  // Formatar valor para moeda brasileira
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "Consulte";
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={classes.root}>
      <ParticlesBackground />
      
      {/* HERO - Sem logo */}
      <Container maxWidth="lg" className={`${classes.hero} sr-hero`}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
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

      {/* FEATURES */}
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

      {/* PLANOS - NOVA SEÇÃO */}
      <Box className={classes.plansSection}>
        <Container maxWidth="lg">
          <Typography variant="h4" className={`${classes.sectionTitle} sr-section-title`}>
            Escolha o plano ideal para o seu negócio
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            style={{ color: "rgba(148, 163, 184, 0.9)", marginBottom: 40 }}
          >
            Planos flexíveis que crescem junto com sua empresa
          </Typography>

          {loadingPlans ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress style={{ color: "#22C55E" }} />
            </Box>
          ) : plans.length === 0 ? (
            <Typography align="center" style={{ color: "rgba(148, 163, 184, 0.7)" }}>
              Nenhum plano disponível no momento. Entre em contato para mais informações.
            </Typography>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {plans.map((plan, index) => {
                const isFeatured = index === Math.floor(plans.length / 2); // Plano do meio como destaque
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                    <Card 
                      className={`${classes.planCard} ${isFeatured ? classes.planCardFeatured : ""} sr-plan-card`}
                    >
                      {isFeatured && (
                        <Chip
                          icon={<StarIcon style={{ color: "#fff" }} />}
                          label="Mais Popular"
                          className={classes.featuredBadge}
                          size="small"
                        />
                      )}
                      <Box className={classes.planCardContent}>
                        <Typography className={classes.planName}>
                          {plan.name}
                        </Typography>
                        
                        <Box className={classes.planPrice}>
                          <Typography component="span" className={classes.planPriceValue}>
                            R$ {formatCurrency(plan.value)}
                          </Typography>
                          <Typography component="span" className={classes.planPriceMonth}>
                            /mês
                          </Typography>
                        </Box>

                        <ul className={classes.planFeaturesList}>
                          <li className={classes.planFeatureItem}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span><strong>{plan.users || 0}</strong> Usuário(s)</span>
                          </li>
                          <li className={classes.planFeatureItem}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span><strong>{plan.connections || 0}</strong> Conexão(ões) WhatsApp</span>
                          </li>
                          <li className={classes.planFeatureItem}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span><strong>{plan.queues || 0}</strong> Fila(s)</span>
                          </li>
                          
                          <li className={`${classes.planFeatureItem} ${!plan.useCampaigns ? classes.planFeatureDisabled : ""}`}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span>Campanhas</span>
                          </li>
                          <li className={`${classes.planFeatureItem} ${!plan.useSchedules ? classes.planFeatureDisabled : ""}`}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span>Agendamentos</span>
                          </li>
                          <li className={`${classes.planFeatureItem} ${!plan.useInternalChat ? classes.planFeatureDisabled : ""}`}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span>Chat Interno</span>
                          </li>
                          <li className={`${classes.planFeatureItem} ${!plan.useKanban ? classes.planFeatureDisabled : ""}`}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span>Kanban</span>
                          </li>
                          <li className={`${classes.planFeatureItem} ${!plan.useOpenAi ? classes.planFeatureDisabled : ""}`}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span>OpenAI / IA</span>
                          </li>
                          <li className={`${classes.planFeatureItem} ${!plan.useIntegrations ? classes.planFeatureDisabled : ""}`}>
                            <CheckCircleIcon className={classes.planFeatureIcon} />
                            <span>Integrações</span>
                          </li>
                        </ul>

                        <Button
                          variant="contained"
                          className={classes.planCta}
                          onClick={() => handleAcquirePlan(plan)}
                          startIcon={<WhatsAppIcon />}
                          fullWidth
                        >
                          ADQUIRIR
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* INTEGRAÇÕES */}
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

      {/* GESTÃO */}
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

      {/* CTA FINAL */}
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

      {/* FOOTER */}
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
