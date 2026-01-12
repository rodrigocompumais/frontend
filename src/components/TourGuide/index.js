import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  makeStyles,
  IconButton,
} from '@material-ui/core';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@material-ui/icons';
import { TourContext } from '../../context/Tour/TourContext';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 16,
      maxWidth: 500,
    },
  },
  content: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  description: {
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
    color: theme.palette.text.secondary,
  },
  stepper: {
    padding: theme.spacing(2, 0),
    backgroundColor: 'transparent',
  },
  actions: {
    padding: theme.spacing(2, 3),
    justifyContent: 'space-between',
  },
  skipButton: {
    color: theme.palette.text.secondary,
  },
  nextButton: {
    minWidth: 100,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    zIndex: 10001,
  },
}));

const TourGuide = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const {
    run,
    stepIndex,
    setStepIndex,
    stopTour,
  } = useContext(TourContext);

  const steps = [
    {
      title: 'Bem-vindo ao Compuchat! 🎉',
      description:
        'Vamos fazer um tour rápido pelas principais funcionalidades do sistema. Este guia vai te ajudar a entender como tudo funciona!',
      page: '/dashboard',
    },
    {
      title: 'Menu de Navegação',
      description:
        'Use o menu superior para acessar todas as funcionalidades do sistema. Tudo está organizado por categorias: Atendimento, Gestão, Automação e Administração.',
      page: '/dashboard',
    },
    {
      title: 'Atendimentos',
      description:
        'Aqui você gerencia todas as conversas com seus clientes. Aceite tickets, responda mensagens e acompanhe o histórico completo de atendimentos em tempo real.',
      page: '/tickets',
    },
    {
      title: 'Contatos',
      description:
        'Gerencie seu banco de contatos completo. Adicione, edite, organize e mantenha todas as informações dos seus clientes e leads em um só lugar.',
      page: '/contacts',
    },
    {
      title: 'Conexões WhatsApp',
      description:
        'Configure suas conexões do WhatsApp aqui. Conecte sua conta para começar a receber e enviar mensagens através da plataforma. Este é o primeiro passo importante!',
      page: '/connections',
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

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleSkip = () => {
    stopTour();
  };

  const handleFinish = () => {
    stopTour();
  };

  if (!run) {
    return null;
  }

  const currentStep = steps[stepIndex];

  return (
    <Dialog
      open={run}
      onClose={handleSkip}
      className={classes.dialog}
      maxWidth="sm"
      fullWidth
    >
      <IconButton
        className={classes.closeButton}
        onClick={handleSkip}
        size="small"
      >
        <CloseIcon />
      </IconButton>

      <DialogContent className={classes.content}>
        <Stepper activeStep={stepIndex} alternativeLabel className={classes.stepper}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>

        <Typography variant="h5" className={classes.title}>
          {currentStep.title}
        </Typography>
        <Typography variant="body1" className={classes.description}>
          {currentStep.description}
        </Typography>
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={handleSkip} className={classes.skipButton}>
          Pular tour
        </Button>
        <Box>
          {stepIndex > 0 && (
            <Button
              onClick={handlePrevious}
              startIcon={<PrevIcon />}
              style={{ marginRight: 8 }}
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            className={classes.nextButton}
            endIcon={stepIndex < steps.length - 1 ? <NextIcon /> : null}
          >
            {stepIndex < steps.length - 1 ? 'Próximo' : 'Finalizar'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TourGuide;
