import React, { useEffect, useState, useMemo } from "react";

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
import AutorenewIcon from "@material-ui/icons/Autorenew";
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import BusinessIcon from "@material-ui/icons/Business";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import SpeedIcon from "@material-ui/icons/Speed";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ScrollReveal from "scrollreveal";

import { Link as RouterLink, useHistory } from "react-router-dom";
import ParticlesBackground from "../../components/ParticlesBackground";
import ImageCarousel from "../../components/ImageCarousel";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  // ===== ROOT & GLOBAL =====
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
    color: "#F9FAFB",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  
  // ===== HERO SECTION =====
  hero: {
    paddingTop: theme.spacing(14),
    paddingBottom: theme.spacing(12),
    position: "relative",
    zIndex: 1,
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 30,
    background: "linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(34, 197, 94, 0.1))",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    width: "fit-content",
    marginBottom: theme.spacing(2),
  },
  heroTagDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22C55E",
    animation: "$pulse 2s infinite",
  },
  heroTagText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#00D9FF",
    letterSpacing: "0.3px",
  },
  heroTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "3rem",
    lineHeight: 1.1,
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 50%, #00D9FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2rem",
    },
  },
  heroSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.15rem",
    lineHeight: 1.7,
    marginBottom: theme.spacing(4),
    color: "rgba(226, 232, 240, 0.85)",
    maxWidth: 500,
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    alignItems: "center",
  },
  primaryCta: {
    padding: "14px 32px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "linear-gradient(135deg, #00D9FF 0%, #22C55E 100%)",
    color: "#0A0A0F",
    boxShadow: "0 4px 20px rgba(0, 217, 255, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 30px rgba(0, 217, 255, 0.5)",
      background: "linear-gradient(135deg, #00E5FF 0%, #2DD881 100%)",
    },
  },
  secondaryCta: {
    padding: "14px 32px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "transparent",
    color: "#F9FAFB",
    border: "1px solid rgba(0, 217, 255, 0.5)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(0, 217, 255, 0.1)",
      borderColor: "#00D9FF",
    },
  },
  noCreditCard: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: theme.spacing(2),
    color: "rgba(148, 163, 184, 0.9)",
    fontSize: "0.85rem",
  },
  heroCarouselWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== AI FEATURES SECTION =====
  aiSection: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    position: "relative",
    background: "linear-gradient(180deg, rgba(0, 217, 255, 0.02) 0%, transparent 50%, rgba(34, 197, 94, 0.02) 100%)",
  },
  aiSectionBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px",
    borderRadius: 30,
    background: "linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(34, 197, 94, 0.15))",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    marginBottom: theme.spacing(2),
  },
  aiSectionBadgeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#00D9FF",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: theme.spacing(2),
    fontWeight: 700,
    fontSize: "2.5rem",
    textAlign: "center",
    background: "linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.75rem",
    },
  },
  sectionSubtitle: {
    fontFamily: "'Inter', sans-serif",
    textAlign: "center",
    color: "rgba(148, 163, 184, 0.9)",
    fontSize: "1.1rem",
    maxWidth: 600,
    margin: "0 auto",
    marginBottom: theme.spacing(6),
    lineHeight: 1.7,
  },

  // ===== AI FEATURE CARDS =====
  aiCard: {
    height: "100%",
    borderRadius: 20,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.8), rgba(10, 10, 15, 0.9))",
    border: "1px solid rgba(0, 217, 255, 0.15)",
    color: "#E5E7EB",
    backdropFilter: "blur(20px)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    contain: "layout paint",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: "linear-gradient(90deg, transparent, #00D9FF, transparent)",
      opacity: 0,
      transition: "opacity 0.3s ease",
    },
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 25px 50px -12px rgba(0, 217, 255, 0.2)",
      borderColor: "rgba(0, 217, 255, 0.4)",
      "&::before": {
        opacity: 1,
      },
    },
  },
  aiCardContent: {
    padding: theme.spacing(4),
  },
  aiIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(34, 197, 94, 0.2))",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    color: "#00D9FF",
    "& svg": {
      fontSize: 28,
    },
  },
  aiCardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "1.2rem",
    marginBottom: theme.spacing(1),
    color: "#F9FAFB",
  },
  aiCardDescription: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem",
    color: "rgba(148, 163, 184, 0.9)",
    lineHeight: 1.6,
  },
  aiCardBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: "4px 10px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #22C55E, #16A34A)",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // ===== GENERAL SECTIONS =====
  section: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    position: "relative",
  },
  cardGrid: {
    marginTop: theme.spacing(2),
  },

  // ===== FEATURE CARDS =====
  featureCard: {
    height: "100%",
    borderRadius: 20,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.7), rgba(10, 10, 15, 0.8))",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#E5E7EB",
    backdropFilter: "blur(15px)",
    transition: "all 0.3s ease",
    contain: "layout paint",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 15px 40px rgba(0, 0, 0, 0.4)",
      borderColor: "rgba(0, 217, 255, 0.3)",
    },
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #22C55E, #16A34A)",
    color: "#fff",
  },
  featureTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "1.1rem",
    marginBottom: theme.spacing(1),
    color: "#F9FAFB",
  },
  featureDescription: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "rgba(148, 163, 184, 0.85)",
    lineHeight: 1.6,
  },

  // ===== PLANS SECTION =====
  plansSection: {
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(12),
    position: "relative",
    background: "linear-gradient(180deg, transparent 0%, rgba(0, 217, 255, 0.02) 50%, transparent 100%)",
  },
  planCard: {
    height: "100%",
    borderRadius: 24,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(10, 10, 15, 0.95))",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#E5E7EB",
    backdropFilter: "blur(20px)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    contain: "layout paint",
    "&:hover": {
      transform: "translateY(-12px) scale(1.02)",
      boxShadow: "0 30px 60px -15px rgba(0, 217, 255, 0.25)",
      borderColor: "rgba(0, 217, 255, 0.5)",
    },
  },
  planCardFeatured: {
    border: "2px solid #00D9FF",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: "linear-gradient(90deg, #00D9FF, #22C55E)",
    },
  },
  planCardContent: {
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  planName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(1),
    color: "#F9FAFB",
  },
  planPrice: {
    marginBottom: theme.spacing(3),
  },
  planPriceValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "2.75rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  planPriceMonth: {
    fontFamily: "'Inter', sans-serif",
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
    fontFamily: "'Inter', sans-serif",
    color: "rgba(226, 232, 240, 0.9)",
    fontSize: "0.95rem",
  },
  planFeatureIcon: {
    color: "#22C55E",
    fontSize: "1.2rem",
  },
  planFeatureDisabled: {
    color: "rgba(100, 116, 139, 0.5)",
    textDecoration: "line-through",
    "& $planFeatureIcon": {
      color: "rgba(100, 116, 139, 0.4)",
    },
  },
  planCta: {
    marginTop: "auto",
    padding: theme.spacing(1.75, 4),
    borderRadius: 14,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #00E5FF, #2DD881)",
      transform: "scale(1.05)",
      boxShadow: "0 10px 30px -10px rgba(0, 217, 255, 0.5)",
    },
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },

  // ===== CTA SECTION =====
  ctaSection: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    position: "relative",
    background: "linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)",
    borderTop: "1px solid rgba(0, 217, 255, 0.2)",
    borderBottom: "1px solid rgba(34, 197, 94, 0.2)",
  },
  ctaTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2.5rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.75rem",
    },
  },
  ctaSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.1rem",
    color: "rgba(226, 232, 240, 0.9)",
    marginBottom: theme.spacing(4),
    lineHeight: 1.7,
  },
  ctaButton: {
    padding: "16px 40px",
    borderRadius: 14,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "1.1rem",
    textTransform: "none",
    background: "#F9FAFB",
    color: "#0A0A0F",
    boxShadow: "0 4px 20px rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "#FFFFFF",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 30px rgba(255, 255, 255, 0.3)",
    },
  },

  // ===== FOOTER =====
  footer: {
    marginTop: "auto",
    padding: theme.spacing(4, 0),
    textAlign: "center",
    color: "rgba(148, 163, 184, 0.7)",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
  },

  // ===== UTILITIES =====
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6),
  },

  // ===== ANIMATIONS =====
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)",
    },
    "70%": {
      boxShadow: "0 0 0 10px rgba(34, 197, 94, 0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(34, 197, 94, 0)",
    },
  },
}));

const Landing = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();
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

  // ScrollReveal otimizado - menos elementos
  useEffect(() => {
    const sr = ScrollReveal({
      distance: "30px",
      duration: 600,
      easing: "ease-out",
      origin: "bottom",
      reset: false,
      viewFactor: 0.1,
    });

    sr.reveal(".sr-hero", { delay: 100 });
    sr.reveal(".sr-section-title", { delay: 100 });
    sr.reveal(".sr-card", { interval: 80 });
    sr.reveal(".sr-plan-card", { interval: 100 });

    return () => {
      sr.destroy();
    };
  }, []);

  // Função para redirecionar para página de cadastro com plano selecionado
  const handleAcquirePlan = (plan) => {
    // Redireciona para a página de signup com o planId como query parameter
    history.push(`/signup?planId=${plan.id}`);
  };

  // Formatar valor para moeda brasileira
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "Consulte";
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // AI Features data
  const aiFeatures = useMemo(() => [
    {
      icon: <AutorenewIcon />,
      title: "Resumo com IA",
      description: "Gere resumos automáticos das conversas para acompanhar rapidamente o contexto de cada atendimento.",
      badge: "Novo",
    },
    {
      icon: <QuestionAnswerIcon />,
      title: "Chatbot Inteligente",
      description: "Responda perguntas automaticamente com base na base de conhecimento da sua empresa.",
      badge: "IA",
    },
    {
      icon: <FlashOnIcon />,
      title: "Campanhas com IA",
      description: "Gere textos persuasivos para campanhas automaticamente usando inteligência artificial.",
      badge: "Novo",
    },
    {
      icon: <EmojiObjectsIcon />,
      title: "Respostas Sugeridas",
      description: "Receba sugestões de respostas em tempo real durante o atendimento para agilizar conversas.",
      badge: "IA",
    },
  ], []);

  return (
    <div className={classes.root}>
      <ParticlesBackground />
      
      {/* ===== HERO SECTION ===== */}
      <Container maxWidth="lg" className={`${classes.hero} sr-hero`}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box className={classes.heroContent}>
              <Box className={classes.heroTag}>
                <Box className={classes.heroTagDot} />
                <Typography className={classes.heroTagText}>
                  Tecnologia de ponta em atendimento
                </Typography>
              </Box>
              
              <Typography variant="h1" className={classes.heroTitle}>
                Atendimento via WhatsApp potencializado com IA
              </Typography>
              
              <Typography variant="h2" className={classes.heroSubtitle}>
                Automatize conversas, gere campanhas inteligentes e acompanhe métricas em tempo real. 
                Tudo em uma única plataforma.
              </Typography>
              
              <Box className={classes.heroActions}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  className={classes.primaryCta}
                >
                  Começar gratuitamente
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  className={classes.secondaryCta}
                >
                  Já sou cliente
                </Button>
              </Box>
              
              <Box className={classes.noCreditCard}>
                <VerifiedUserIcon style={{ fontSize: 16, color: "#22C55E" }} />
                <span>Teste grátis • Sem cartão de crédito • Setup em 2 minutos</span>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box className={classes.heroCarouselWrapper}>
              <ImageCarousel autoSlide={true} autoSlideInterval={4000} />
            </Box>
          </Grid>
        </Grid>
      </Container>


      {/* ===== AI FEATURES SECTION ===== */}
      <Box className={classes.aiSection}>
        <Container maxWidth="lg">
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box className={classes.aiSectionBadge}>
              <SpeedIcon style={{ fontSize: 16, color: "#00D9FF" }} />
              <Typography className={classes.aiSectionBadgeText}>
                Inteligência Artificial
              </Typography>
            </Box>
            
            <Typography variant="h3" className={`${classes.sectionTitle} sr-section-title`}>
              Recursos de IA que transformam seu atendimento
            </Typography>
            
            <Typography className={classes.sectionSubtitle}>
              Automatize tarefas repetitivas, melhore a qualidade das respostas e 
              aumente a produtividade da sua equipe com inteligência artificial.
            </Typography>
          </Box>
          
          <Grid container spacing={4} className={classes.cardGrid}>
            {aiFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={`${classes.aiCard} sr-card`}>
                  <span className={classes.aiCardBadge}>{feature.badge}</span>
                  <CardContent className={classes.aiCardContent}>
                    <Box className={classes.aiIconWrapper}>
                      {feature.icon}
                    </Box>
                    <Typography className={classes.aiCardTitle}>
                      {feature.title}
                    </Typography>
                    <Typography className={classes.aiCardDescription}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== FEATURES SECTION ===== */}
      <Box className={classes.section}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={`${classes.sectionTitle} sr-section-title`}>
            Tudo que você precisa para um atendimento moderno
          </Typography>
          <Typography className={classes.sectionSubtitle}>
            Ferramentas completas para centralizar, automatizar e escalar seu atendimento via WhatsApp.
          </Typography>
          
          <Grid container spacing={4} className={classes.cardGrid}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ChatIcon />
                  </Box>
                  <Typography className={classes.featureTitle}>
                    CRM de chat interno
                  </Typography>
                  <Typography className={classes.featureDescription}>
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
                  <Typography className={classes.featureTitle}>
                    Multiusuários & times
                  </Typography>
                  <Typography className={classes.featureDescription}>
                    Vários atendentes trabalhando ao mesmo tempo, com filas, 
                    filas de espera e distribuição inteligente de tickets.
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
                  <Typography className={classes.featureTitle}>
                    Múltiplas contas WhatsApp
                  </Typography>
                  <Typography className={classes.featureDescription}>
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
                  <Typography className={classes.featureTitle}>
                    Campanhas em massa
                  </Typography>
                  <Typography className={classes.featureDescription}>
                    Crie campanhas com disparos em massa, filtros de contatos e
                    acompanhamento de resultados em tempo real.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== PLANS SECTION ===== */}
      <Box className={classes.plansSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={`${classes.sectionTitle} sr-section-title`}>
            Escolha o plano ideal para o seu negócio
          </Typography>
          <Typography className={classes.sectionSubtitle}>
            Planos flexíveis que crescem junto com sua empresa. Comece grátis e escale conforme necessário.
          </Typography>

          {loadingPlans ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress style={{ color: "#00D9FF" }} />
            </Box>
          ) : plans.length === 0 ? (
            <Typography align="center" style={{ color: "rgba(148, 163, 184, 0.7)" }}>
              Nenhum plano disponível no momento. Entre em contato para mais informações.
            </Typography>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {plans.map((plan, index) => {
                const isFeatured = index === Math.floor(plans.length / 2);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                    <Card 
                      className={`${classes.planCard} ${isFeatured ? classes.planCardFeatured : ""} sr-plan-card`}
                    >
                      {isFeatured && (
                        <Chip
                          icon={<StarIcon style={{ color: "#0A0A0F" }} />}
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
                            <span>Recursos de IA</span>
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
                          endIcon={<ArrowForwardIcon />}
                          fullWidth
                        >
                          ADQUIRIR AGORA
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

      {/* ===== INTEGRATIONS SECTION ===== */}
      <Box className={classes.section}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={`${classes.sectionTitle} sr-section-title`}>
            Integrações poderosas para ir além
          </Typography>
          <Typography className={classes.sectionSubtitle}>
            Conecte suas ferramentas favoritas e automatize processos de ponta a ponta.
          </Typography>
          
          <Grid container spacing={4} className={classes.cardGrid}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ExtensionIcon />
                  </Box>
                  <Typography className={classes.featureTitle}>
                    OpenAI & chatbots inteligentes
                  </Typography>
                  <Typography className={classes.featureDescription}>
                    Use inteligência artificial para responder de forma rápida e
                    personalizada, integrando com OpenAI e Google Gemini.
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
                  <Typography className={classes.featureTitle}>
                    Dialogflow, N8N, Webhooks
                  </Typography>
                  <Typography className={classes.featureDescription}>
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
                  <Typography className={classes.featureTitle}>
                    Flowbuilder visual
                  </Typography>
                  <Typography className={classes.featureDescription}>
                    Desenhe fluxos de atendimento com blocos visuais, menus,
                    perguntas e respostas automatizadas de forma intuitiva.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== MANAGEMENT SECTION ===== */}
      <Box className={classes.section}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={`${classes.sectionTitle} sr-section-title`}>
            Gestão completa: do contato ao resultado
          </Typography>
          <Typography className={classes.sectionSubtitle}>
            Acompanhe cada etapa do funil e tenha total controle sobre métricas e desempenho.
          </Typography>
          
          <Grid container spacing={4} className={classes.cardGrid}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={`${classes.featureCard} sr-card`}>
                <CardContent>
                  <Box className={classes.featureIconWrapper}>
                    <ScheduleIcon />
                  </Box>
                  <Typography className={classes.featureTitle}>
                    Agendamento de disparos
                  </Typography>
                  <Typography className={classes.featureDescription}>
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
                  <Typography className={classes.featureTitle}>
                    CRM Kanban
                  </Typography>
                  <Typography className={classes.featureDescription}>
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
                  <Typography className={classes.featureTitle}>
                    Tarefas & dashboards
                  </Typography>
                  <Typography className={classes.featureDescription}>
                    Acompanhe tarefas da equipe e monitore indicadores-chave em
                    dashboards pensados para gestão.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== CTA FINAL SECTION ===== */}
      <Box className={classes.ctaSection}>
        <Container maxWidth="md">
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <Typography className={classes.ctaTitle}>
              Pronto para revolucionar seu atendimento?
            </Typography>
            <Typography className={classes.ctaSubtitle}>
              Transforme seu atendimento via WhatsApp com inteligência artificial. 
              Comece gratuitamente em menos de 2 minutos.
            </Typography>
            <Button
              component={RouterLink}
              to="/signup"
              className={classes.ctaButton}
            >
              Criar minha conta grátis
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== FOOTER ===== */}
      <Box className={classes.footer}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Compuchat - CRM de Atendimento WhatsApp. 
          Todos os direitos reservados.
        </Typography>
      </Box>
    </div>
  );
};

export default Landing;
