import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  makeStyles,
  IconButton,
  LinearProgress,
  Fade,
  Zoom,
  useTheme,
} from '@material-ui/core';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
  EmojiEvents as TrophyIcon,
} from '@material-ui/icons';
import { TourContext } from '../../context/Tour/TourContext';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1300,
    animation: '$fadeIn 0.5s ease-in',
    backdropFilter: 'blur(6px)',
    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 70%)',
  },
  spotlight: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1299,
    pointerEvents: 'none',
    background: 'radial-gradient(circle 400px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), transparent 0%, rgba(0, 0, 0, 0.95) 70%)',
    animation: '$spotlightPulse 2s ease-in-out infinite',
  },
  '@keyframes spotlightPulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.8,
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  '@keyframes slideUp': {
    from: {
      transform: 'translateY(50px)',
      opacity: 0,
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
    },
    '50%': {
      transform: 'scale(1.05)',
      boxShadow: '0 0 0 20px rgba(25, 118, 210, 0)',
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
    },
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '-1000px 0',
    },
    '100%': {
      backgroundPosition: '1000px 0',
    },
  },
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
  '@keyframes confetti': {
    '0%': {
      transform: 'translateY(0) rotate(0deg)',
      opacity: 1,
    },
    '100%': {
      transform: 'translateY(-100vh) rotate(720deg)',
      opacity: 0,
    },
  },
  '@keyframes sparkle': {
    '0%, 100%': {
      opacity: 0,
      transform: 'scale(0)',
    },
    '50%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  particles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1298,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'rgba(25, 118, 210, 0.6)',
    animation: '$sparkle 3s ease-in-out infinite',
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 24,
      maxWidth: 600,
      background: theme.palette.type === 'dark'
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(25, 118, 210, 0.2)',
      border: `1px solid ${theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      position: 'relative',
      overflow: 'hidden',
      animation: '$slideUp 0.5s ease-out',
    },
    '& .MuiDialog-paper::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
      backgroundSize: '200% 100%',
      animation: '$shimmer 3s infinite',
    },
  },
  content: {
    padding: theme.spacing(4),
    textAlign: 'center',
    position: 'relative',
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: '$float 3s ease-in-out infinite',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1976d2, #42a5f5, #1976d2)',
    backgroundSize: '200% 200%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(25, 118, 210, 0.5), 0 0 60px rgba(25, 118, 210, 0.3)',
    animation: '$pulse 2s infinite, $shimmer 3s infinite',
    fontSize: '3rem',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -4,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1976d2, #42a5f5, #1976d2)',
      backgroundSize: '200% 200%',
      zIndex: -1,
      filter: 'blur(10px)',
      opacity: 0.6,
      animation: '$pulse 2s infinite',
    },
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 700,
    fontSize: '1.75rem',
    background: theme.palette.type === 'dark'
      ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
      : 'linear-gradient(135deg, #1976d2, #42a5f5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.3,
  },
  description: {
    marginBottom: theme.spacing(3),
    lineHeight: 1.8,
    color: theme.palette.text.secondary,
    fontSize: '1rem',
    padding: theme.spacing(0, 2),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    '& .MuiLinearProgress-bar': {
      borderRadius: 3,
      background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
      backgroundSize: '200% 100%',
      animation: '$shimmer 2s infinite',
    },
  },
  progressText: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
    fontWeight: 500,
  },
  actions: {
    padding: theme.spacing(2, 4),
    justifyContent: 'space-between',
    background: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    borderTop: `1px solid ${theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  },
  skipButton: {
    color: theme.palette.text.secondary,
    textTransform: 'none',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
  },
  navButton: {
    minWidth: 120,
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 12,
    padding: theme.spacing(1, 3),
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
    },
  },
  nextButton: {
    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
    color: '#ffffff',
    '&:hover': {
      background: 'linear-gradient(135deg, #1565c0, #1976d2)',
    },
  },
  prevButton: {
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    zIndex: 10001,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      transform: 'rotate(90deg)',
    },
    transition: 'all 0.3s ease',
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  stepDotActive: {
    width: 24,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    boxShadow: '0 0 10px rgba(25, 118, 210, 0.5)',
  },
  stepDotInactive: {
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: '50%',
    animation: '$confetti 3s ease-out forwards',
  },
  emoji: {
    fontSize: '2rem',
    marginRight: theme.spacing(1),
    display: 'inline-block',
    animation: '$float 2s ease-in-out infinite',
  },
}));

const TourGuide = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const {
    run,
    stepIndex,
    setStepIndex,
    stopTour,
  } = useContext(TourContext);
  const [showConfetti, setShowConfetti] = useState(false);

  const steps = [
    {
      title: 'Bem-vindo ao Compuchat! 🎉',
      description:
        'Vamos fazer um tour completo pelas principais funcionalidades do sistema. Este guia vai te ajudar a entender como tudo funciona e aproveitar ao máximo a plataforma!',
      page: '/dashboard',
      icon: '🎉',
    },
    {
      title: 'Dashboard - Seu Centro de Comando',
      description:
        'O Dashboard é seu centro de comando! Aqui você vê métricas em tempo real, estatísticas de atendimentos, gráficos de performance e muito mais. Use os filtros para analisar diferentes períodos.',
      page: '/dashboard',
      icon: '📊',
    },
    {
      title: 'Compuchat AI - Seu Assistente Inteligente',
      description:
        'O Compuchat AI é um assistente inteligente disponível no dashboard. Use-o para tirar dúvidas sobre o sistema, consultar informações de tickets, estatísticas e funcionalidades. Procure pelo botão flutuante!',
      page: '/dashboard',
      icon: '🤖',
    },
    {
      title: 'Menu de Navegação',
      description:
        'Use o menu superior para acessar todas as funcionalidades do sistema. Tudo está organizado por categorias: Atendimento, Gestão, Automação e Administração. Explore cada seção!',
      page: '/dashboard',
      icon: '🧭',
    },
    {
      title: 'Atendimentos - Conversas e Grupos',
      description:
        'Gerencie todas as conversas com seus clientes. A aba "Abertos" tem sub-abas: "Conversas" (individuais) e "Grupos" (WhatsApp). Aceite tickets, responda mensagens e use ferramentas de IA para melhorar seu atendimento.',
      page: '/tickets',
      icon: '💬',
    },
    {
      title: 'Inteligência Artificial no Atendimento',
      description:
        'Durante o atendimento, use as ferramentas de IA: Analisar conversa, Sugerir resposta, Melhorar mensagem, Transcrever áudios e Resumir áudios não ouvidos. Mensagens em outros idiomas são traduzidas automaticamente!',
      page: '/tickets',
      icon: '✨',
    },
    {
      title: 'Contatos',
      description:
        'Gerencie seu banco de contatos completo. Adicione, edite, organize e mantenha todas as informações dos seus clientes e leads. Crie listas de contatos para campanhas segmentadas.',
      page: '/contacts',
      icon: '👥',
    },
    {
      title: 'Conexões WhatsApp',
      description:
        'Configure suas conexões do WhatsApp aqui. Conecte sua conta escaneando o QR Code para começar a receber e enviar mensagens através da plataforma. Este é o primeiro passo importante!',
      page: '/connections',
      icon: '📱',
    },
    {
      title: 'Tarefas',
      description:
        'Organize seu trabalho com tarefas! Crie tarefas relacionadas a tickets ou contatos, defina prioridades, prazos e atribua a outros usuários. Visualize em lista ou Kanban.',
      page: '/todolist',
      icon: '✅',
    },
    {
      title: 'Agendamentos',
      description:
        'Agende mensagens para envio futuro ou crie compromissos. Configure lembretes e mantenha sua agenda organizada. Útil para follow-ups e retornos programados.',
      page: '/schedules',
      icon: '📅',
    },
    {
      title: 'Campanhas',
      description:
        'Crie campanhas de envio em massa para seus contatos. Selecione listas de contatos, configure mensagens personalizadas e agende envios. Acompanhe relatórios de entrega e resposta.',
      page: '/campaigns',
      icon: '📢',
    },
    {
      title: 'Flow Builder - Automação',
      description:
        'Automatize respostas com Flow Builder! Crie fluxos de conversa visuais com drag-and-drop. Configure palavras-chave, condições e integre com IA para respostas inteligentes.',
      page: '/flowbuilder',
      icon: '🔄',
    },
    {
      title: 'Formulários',
      description:
        'Crie formulários web personalizados para coletar informações de clientes. Configure campos, validações e ações automáticas. Analise respostas com gráficos e métricas.',
      page: '/forms',
      icon: '📝',
    },
    {
      title: 'Configurações e IA',
      description:
        'Configure chaves de API (OpenAI/Gemini), escolha providers por funcionalidade, defina idioma da empresa para tradução automática e personalize prompts. Configure também botões de acesso rápido!',
      page: '/settings',
      icon: '⚙️',
    },
    {
      title: 'Pronto para Começar! 🚀',
      description:
        'Você conheceu as principais funcionalidades do Compuchat! Lembre-se: use o Compuchat AI no dashboard para tirar dúvidas, explore o menu para descobrir mais recursos e consulte o manual quando precisar. Boa sorte!',
      page: '/dashboard',
      icon: '🚀',
    },
  ];

  useEffect(() => {
    if (run && steps[stepIndex]) {
      const currentStep = steps[stepIndex];
      
      // Navegar para a página do step se necessário
      if (currentStep.page && location.pathname !== currentStep.page) {
        history.push(currentStep.page);
      }
    }
  }, [run, stepIndex, location.pathname, history]);

  useEffect(() => {
    // Mostrar confetti no último passo
    if (stepIndex === steps.length - 1 && run) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [stepIndex, run, steps.length]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      // Pequeno delay para animação suave
      setTimeout(() => {
        setStepIndex(stepIndex + 1);
      }, 100);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (stepIndex > 0) {
      // Pequeno delay para animação suave
      setTimeout(() => {
        setStepIndex(stepIndex - 1);
      }, 100);
    }
  };

  const handleSkip = () => {
    stopTour();
  };

  const handleFinish = () => {
    setShowConfetti(true);
    setTimeout(() => {
      stopTour();
    }, 1000);
  };

  if (!run) {
    return null;
  }

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLastStep = stepIndex === steps.length - 1;

  // Gerar confetti
  const confettiColors = ['#1976d2', '#42a5f5', '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff6b9d'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  }));

  // Partículas de fundo
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() * 4 + 2,
  }));

  return (
    <>
      <Box className={classes.particles}>
        {particles.map((particle) => (
          <Box
            key={particle.id}
            className={classes.particle}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </Box>
      <Box className={classes.spotlight} />
      <Box className={classes.overlay} onClick={handleSkip} />
      <Dialog
        open={run}
        onClose={handleSkip}
        className={classes.dialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            position: 'relative',
            zIndex: 1301,
          },
        }}
      >
        {showConfetti && (
          <Box className={classes.confettiContainer}>
            {confettiPieces.map((piece) => (
              <Box
                key={piece.id}
                className={classes.confetti}
                style={{
                  left: `${piece.left}%`,
                  backgroundColor: piece.color,
                  animationDelay: `${piece.delay}s`,
                }}
              />
            ))}
          </Box>
        )}

        <IconButton
          className={classes.closeButton}
          onClick={handleSkip}
          size="small"
        >
          <CloseIcon />
        </IconButton>

        <DialogContent className={classes.content}>
          <Fade in={true} timeout={500}>
            <Box>
              <Box className={classes.iconContainer}>
                <Box className={classes.iconWrapper}>
                  <span className={classes.emoji} style={{ animationDelay: '0s' }}>
                    {currentStep.icon}
                  </span>
                </Box>
              </Box>

              <Typography variant="h4" className={classes.title}>
                {currentStep.title}
              </Typography>

              <Typography variant="body1" className={classes.description}>
                {currentStep.description}
              </Typography>

              <Box className={classes.progressContainer}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  className={classes.progressBar}
                />
                <Typography variant="caption" className={classes.progressText}>
                  Passo {stepIndex + 1} de {steps.length} • {Math.round(progress)}% concluído
                </Typography>
              </Box>

              <Box className={classes.stepIndicator}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    className={`${classes.stepDot} ${
                      index === stepIndex
                        ? classes.stepDotActive
                        : index < stepIndex
                        ? classes.stepDotInactive
                        : classes.stepDotInactive
                    }`}
                  />
                ))}
              </Box>
            </Box>
          </Fade>
        </DialogContent>

        <DialogActions className={classes.actions}>
          <Button onClick={handleSkip} className={classes.skipButton}>
            Pular tour
          </Button>
          <Box display="flex" gap={1}>
            {stepIndex > 0 && (
              <Zoom in={stepIndex > 0}>
                <Button
                  onClick={handlePrevious}
                  startIcon={<PrevIcon />}
                  className={`${classes.navButton} ${classes.prevButton}`}
                >
                  Voltar
                </Button>
              </Zoom>
            )}
            <Zoom in={true}>
              <Button
                onClick={handleNext}
                variant="contained"
                className={`${classes.navButton} ${classes.nextButton}`}
                endIcon={isLastStep ? <TrophyIcon /> : <NextIcon />}
              >
                {isLastStep ? 'Finalizar' : 'Próximo'}
              </Button>
            </Zoom>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TourGuide;
