import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  makeStyles,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";
import { Rating, Alert } from "@material-ui/lab";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.type === "dark" ? "#121212" : "#f5f5f5",
  },
  container: {
    maxWidth: 600,
    width: "100%",
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  formPaper: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[3],
  },
  header: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
  logo: {
    maxWidth: 150,
    maxHeight: 80,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  fieldContainer: {
    marginBottom: theme.spacing(3),
  },
  fieldLabel: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },
  required: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
  },
  helpText: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  submitButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5),
    fontSize: "1rem",
    fontWeight: 600,
  },
  successMessage: {
    padding: theme.spacing(3),
    textAlign: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
  },
}));

const PublicForm = () => {
  const classes = useStyles();
  const { slug } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      const { data } = await api.get(`/public/forms/${slug}`);
      setForm(data);
      
      // Initialize answers
      const initialAnswers = {};
      (data.fields || []).forEach((field) => {
        if (field.fieldType === "checkbox") {
          initialAnswers[field.id] = [];
        } else if (field.fieldType === "rating") {
          initialAnswers[field.id] = 0;
        } else {
          initialAnswers[field.id] = "";
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      toastError(err);
      setTimeout(() => {
        history.push("/");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    (form.fields || []).forEach((field) => {
      if (field.isRequired) {
        const answer = answers[field.id];
        if (
          !answer ||
          (Array.isArray(answer) && answer.length === 0) ||
          (typeof answer === "string" && answer.trim() === "") ||
          answer === 0
        ) {
          newErrors[field.id] = `${field.label} é obrigatório`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    try {
      const answersArray = Object.keys(answers).map((fieldId) => ({
        fieldId: Number(fieldId),
        answer: answers[fieldId],
      }));

      await api.post(`/public/forms/${slug}/submit`, {
        answers: answersArray,
      });

      setSubmitted(true);

      if (form.successRedirectUrl) {
        setTimeout(() => {
          window.location.href = form.successRedirectUrl;
        }, 2000);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = answers[field.id] || "";
    const error = errors[field.id];
    const hasError = !!error;

    switch (field.fieldType) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <TextField
            fullWidth
            variant="outlined"
            type={field.fieldType === "email" ? "email" : field.fieldType === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            inputProps={{
              maxLength: field.validation?.maxLength,
              minLength: field.validation?.minLength,
            }}
          />
        );

      case "textarea":
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
          />
        );

      case "select":
        return (
          <FormControl fullWidth variant="outlined" error={hasError}>
            <InputLabel>{field.placeholder || "Selecione..."}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              label={field.placeholder || "Selecione..."}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case "radio":
        return (
          <FormControl component="fieldset" error={hasError} fullWidth>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case "checkbox":
        const checkboxValue = Array.isArray(value) ? value : [];
        return (
          <FormControl component="fieldset" error={hasError} fullWidth>
            <Box>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={checkboxValue.includes(option)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...checkboxValue, option]
                          : checkboxValue.filter((v) => v !== option);
                        handleFieldChange(field.id, newValue);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </Box>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case "date":
        return (
          <TextField
            fullWidth
            variant="outlined"
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={hasError}
            helperText={error || field.helpText}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case "rating":
        return (
          <Box>
            <Rating
              value={value || 0}
              onChange={(event, newValue) => {
                handleFieldChange(field.id, newValue || 0);
              }}
              size="large"
            />
            {(error || field.helpText) && (
              <FormHelperText error={hasError}>
                {error || field.helpText}
              </FormHelperText>
            )}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return (
      <Box className={classes.root}>
        <Alert severity="error">Formulário não encontrado</Alert>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box className={classes.root}>
        <Paper className={classes.formPaper}>
          <Box className={classes.successMessage}>
            <Alert severity="success" style={{ marginBottom: 16 }}>
              {form.successMessage || "Obrigado! Sua resposta foi enviada com sucesso."}
            </Alert>
            {form.successRedirectUrl && (
              <Typography variant="body2" color="textSecondary">
                Você será redirecionado em instantes...
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  const sortedFields = (form.fields || []).sort((a, b) => a.order - b.order);

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        <Paper
          className={classes.formPaper}
          style={{
            backgroundColor: form.primaryColor
              ? `${form.primaryColor}05`
              : undefined,
          }}
        >
          {form.logoUrl && (
            <Box
              style={{
                textAlign: form.logoPosition === "center" ? "center" : form.logoPosition === "bottom" ? "right" : "left",
                marginBottom: form.logoPosition === "bottom" ? 0 : 16,
                marginTop: form.logoPosition === "top" ? 0 : 16,
              }}
            >
              <img
                src={form.logoUrl}
                alt="Logo"
                className={classes.logo}
                style={{
                  marginLeft: form.logoPosition === "right" ? "auto" : 0,
                  marginRight: form.logoPosition === "left" ? "auto" : 0,
                  display: "block",
                }}
              />
            </Box>
          )}

          <Box className={classes.header}>
            <Typography
              className={classes.title}
              style={{ color: form.primaryColor || undefined }}
            >
              {form.name}
            </Typography>
            {form.description && (
              <Typography className={classes.description}>
                {form.description}
              </Typography>
            )}
          </Box>

          <form onSubmit={handleSubmit}>
            {sortedFields.map((field) => (
              <Box key={field.id} className={classes.fieldContainer}>
                <Typography className={classes.fieldLabel}>
                  {field.label}
                  {field.isRequired && (
                    <span className={classes.required}>*</span>
                  )}
                </Typography>
                {renderField(field)}
              </Box>
            ))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className={classes.submitButton}
              disabled={submitting}
              style={{
                backgroundColor: form.primaryColor || undefined,
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={24} style={{ marginRight: 8 }} />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default PublicForm;
