import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Box,
} from "@material-ui/core";
import { AVAILABLE_ROUTES, AVAILABLE_ICONS, DEFAULT_COLORS } from "../../utils/availableRoutes";
import * as Icons from "@material-ui/icons";
import useQuickAccessButtons from "../../hooks/useQuickAccessButtons";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1, 0),
    minWidth: "100%",
  },
  iconPreview: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  buttonProgress: {
    position: "absolute",
  },
}));

const QuickAccessButtonModal = ({ open, onClose, buttonId = null }) => {
  const classes = useStyles();
  const { buttons, create, update, loading } = useQuickAccessButtons();
  const [selectedRoute, setSelectedRoute] = useState("");

  const editingButton = buttonId ? buttons.find((b) => b.id === buttonId) : null;

  const initialValues = {
    label: editingButton?.label || "",
    route: editingButton?.route || "",
    icon: editingButton?.icon || "",
    color: editingButton?.color || DEFAULT_COLORS[0],
  };

  const validationSchema = Yup.object().shape({
    label: Yup.string().required("Label é obrigatório").max(20, "Máximo 20 caracteres"),
    route: Yup.string().required("Rota é obrigatória"),
    icon: Yup.string().nullable(),
    color: Yup.string().required("Cor é obrigatória"),
  });

  useEffect(() => {
    if (editingButton) {
      setSelectedRoute(editingButton.route);
    }
  }, [editingButton]);

  const handleRouteChange = (route, setFieldValue) => {
    setSelectedRoute(route);
    setFieldValue("route", route);
    // Preencher automaticamente label e ícone se não estiverem preenchidos
    const routeInfo = AVAILABLE_ROUTES.find((r) => r.path === route);
    if (routeInfo && !editingButton) {
      setFieldValue("label", routeInfo.label);
      if (!initialValues.icon) {
        setFieldValue("icon", routeInfo.defaultIcon);
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (editingButton) {
        await update(buttonId, values);
      } else {
        await create(values);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getIconComponent = (iconName) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogTitle>
              {editingButton ? "Editar Botão de Acesso Rápido" : "Novo Botão de Acesso Rápido"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel>Rota</InputLabel>
                    <Field
                      as={Select}
                      name="route"
                      label="Rota"
                      value={values.route}
                      onChange={(e) => handleRouteChange(e.target.value, setFieldValue)}
                      error={touched.route && !!errors.route}
                    >
                      {AVAILABLE_ROUTES.map((route) => (
                        <MenuItem key={route.path} value={route.path}>
                          {route.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="label"
                    label="Label"
                    fullWidth
                    error={touched.label && !!errors.label}
                    helperText={touched.label && errors.label}
                    inputProps={{ maxLength: 20 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel>Ícone</InputLabel>
                    <Field
                      as={Select}
                      name="icon"
                      label="Ícone"
                      value={values.icon || ""}
                      onChange={(e) => setFieldValue("icon", e.target.value)}
                    >
                      <MenuItem value="">Nenhum</MenuItem>
                      {AVAILABLE_ICONS.map((iconName) => (
                        <MenuItem key={iconName} value={iconName}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getIconComponent(iconName)}
                            <span>{iconName}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel>Cor</InputLabel>
                    <Field
                      as={Select}
                      name="color"
                      label="Cor"
                      value={values.color}
                      onChange={(e) => setFieldValue("color", e.target.value)}
                    >
                      {DEFAULT_COLORS.map((color) => (
                        <MenuItem key={color} value={color}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              className={classes.colorPreview}
                              style={{ backgroundColor: color }}
                            />
                            <span>{color}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>

                {values.icon && (
                  <Grid item xs={12}>
                    <Box className={classes.iconPreview}>
                      <span>Preview do ícone:</span>
                      {getIconComponent(values.icon)}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary">
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <CircularProgress size={24} className={classes.buttonProgress} />
                ) : (
                  editingButton ? "Atualizar" : "Criar"
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default QuickAccessButtonModal;
