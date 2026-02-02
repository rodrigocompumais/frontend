import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  makeStyles,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import SendIcon from "@material-ui/icons/Send";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
    color: "#F9FAFB",
    position: "relative",
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(6),
  },
  container: {
    maxWidth: 800,
    marginTop: theme.spacing(4),
  },
  formPaper: {
    padding: theme.spacing(4),
    borderRadius: 20,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(10, 10, 15, 0.95))",
    border: "1px solid rgba(0, 217, 255, 0.2)",
    backdropFilter: "blur(20px)",
  },
  header: {
    marginBottom: theme.spacing(4),
    textAlign: "center",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2.5rem",
    marginBottom: theme.spacing(1),
    background: "linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 50%, #00D9FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.75rem",
    },
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.1rem",
    color: "rgba(148, 163, 184, 0.9)",
    lineHeight: 1.7,
  },
  fieldContainer: {
    marginBottom: theme.spacing(3),
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: "#F9FAFB",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      background: "rgba(17, 24, 39, 0.5)",
      color: "#F9FAFB",
      "& fieldset": {
        borderColor: "rgba(0, 217, 255, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(0, 217, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00D9FF",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(148, 163, 184, 0.9)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#00D9FF",
    },
  },
  checkboxContainer: {
    marginTop: theme.spacing(2),
  },
  checkbox: {
    color: "#00D9FF",
    "&.Mui-checked": {
      color: "#00D9FF",
    },
  },
  checkboxLabel: {
    color: "rgba(226, 232, 240, 0.9)",
    fontFamily: "'Inter', sans-serif",
  },
  submitButton: {
    marginTop: theme.spacing(4),
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
      transform: "translateY(-2px)",
      boxShadow: "0 8px 30px rgba(0, 217, 255, 0.5)",
    },
    "&:disabled": {
      opacity: 0.6,
    },
  },
  backButton: {
    marginBottom: theme.spacing(2),
    color: "#00D9FF",
    textTransform: "none",
  },
  successMessage: {
    padding: theme.spacing(4),
    textAlign: "center",
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(10, 10, 15, 0.95))",
    borderRadius: 20,
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  successTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2rem",
    color: "#22C55E",
    marginBottom: theme.spacing(2),
  },
  successText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.1rem",
    color: "rgba(226, 232, 240, 0.9)",
    lineHeight: 1.7,
  },
}));

const FEATURES = [
  { id: "ai", label: "Recursos de IA" },
  { id: "translation", label: "Tradução em tempo real" },
  { id: "forms", label: "Formulários customizados" },
  { id: "campaigns", label: "Campanhas em massa" },
  { id: "internal-chat", label: "Chat interno" },
  { id: "kanban", label: "Kanban" },
  { id: "integrations", label: "Integrações" },
  { id: "flowbuilder", label: "Flowbuilder" },
];

const CustomProposalForm = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    users: "",
    collaborators: "",
    features: [],
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get("planId");
    if (planId) {
      // Opcional: carregar dados do plano se necessário
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFeatureChange = (featureId) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((id) => id !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    
    if (!formData.company.trim()) {
      newErrors.company = "Empresa é obrigatória";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }
    
    if (!formData.users || parseInt(formData.users) <= 0) {
      newErrors.users = "Quantidade de usuários deve ser maior que zero";
    }
    
    if (!formData.collaborators || parseInt(formData.collaborators) <= 0) {
      newErrors.collaborators = "Quantidade de colaboradores deve ser maior que zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Por favor, preencha todos os campos obrigatórios corretamente");
      return;
    }
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams(location.search);
      const planId = params.get("planId");
      
      await api.post("/custom-proposals", {
        ...formData,
        users: parseInt(formData.users),
        collaborators: parseInt(formData.collaborators),
        planId: planId || null,
      });
      
      setSubmitted(true);
      toast.success("Proposta enviada com sucesso! Entraremos em contato em breve.");
    } catch (err) {
      console.error("Erro ao enviar proposta:", err);
      toast.error(err.response?.data?.message || "Erro ao enviar proposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={classes.root}>
        <Container className={classes.container}>
          <Paper className={classes.successMessage}>
            <Typography className={classes.successTitle}>
              Proposta Enviada com Sucesso!
            </Typography>
            <Typography className={classes.successText}>
              Recebemos sua solicitação de proposta personalizada. Nossa equipe entrará em contato 
              em breve para discutir as melhores opções para sua empresa.
            </Typography>
            <Button
              variant="contained"
              className={classes.submitButton}
              onClick={() => history.push("/")}
              style={{ marginTop: 24 }}
            >
              Voltar para a página inicial
            </Button>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push("/#plans")}
          className={classes.backButton}
        >
          Voltar para planos
        </Button>

        <Paper className={classes.formPaper}>
          <Box className={classes.header}>
            <Typography className={classes.title}>
              Solicitar Proposta Personalizada
            </Typography>
            <Typography className={classes.subtitle}>
              Preencha o formulário abaixo e nossa equipe entrará em contato para criar 
              uma proposta sob medida para suas necessidades.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Nome Completo *
                  </Typography>
                  <TextField
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="Seu nome completo"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Empresa *
                  </Typography>
                  <TextField
                    fullWidth
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    error={!!errors.company}
                    helperText={errors.company}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="Nome da sua empresa"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="seu@email.com"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Telefone *
                  </Typography>
                  <TextField
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="(00) 00000-0000"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Quantidade de Usuários *
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    name="users"
                    value={formData.users}
                    onChange={handleChange}
                    error={!!errors.users}
                    helperText={errors.users}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="Ex: 10"
                    inputProps={{ min: 1 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Quantidade de Colaboradores *
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    name="collaborators"
                    value={formData.collaborators}
                    onChange={handleChange}
                    error={!!errors.collaborators}
                    helperText={errors.collaborators}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="Ex: 5"
                    inputProps={{ min: 1 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Recursos Necessários
                  </Typography>
                  <Box className={classes.checkboxContainer}>
                    <Grid container spacing={2}>
                      {FEATURES.map((feature) => (
                        <Grid item xs={12} sm={6} key={feature.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.features.includes(feature.id)}
                                onChange={() => handleFeatureChange(feature.id)}
                                className={classes.checkbox}
                              />
                            }
                            label={
                              <Typography className={classes.checkboxLabel}>
                                {feature.label}
                              </Typography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box className={classes.fieldContainer}>
                  <Typography className={classes.label}>
                    Mensagem Adicional (Opcional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={classes.textField}
                    variant="outlined"
                    placeholder="Conte-nos mais sobre suas necessidades específicas..."
                  />
                </Box>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className={classes.submitButton}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} style={{ color: "#0A0A0F" }} /> : <SendIcon />}
            >
              {loading ? "Enviando..." : "Enviar Proposta"}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default CustomProposalForm;
