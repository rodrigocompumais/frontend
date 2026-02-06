import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  FormControlLabel,
  Switch,
  Typography,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";
import { Edit as EditIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import useModules from "../../hooks/useModules";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: "100%",
    flex: 1,
    padding: theme.spacing(2),
  },
  fullWidth: {
    width: "100%",
  },
  tableContainer: {
    width: "100%",
    overflowX: "scroll",
    ...theme.scrollbarStyles,
  },
}));

function ModuleForm({ onSubmit, onDelete, onCancel, initialValue, loading }) {
  const classes = useStyles();
  const [record, setRecord] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    isActive: true,
    ...initialValue,
  });

  useEffect(() => {
    setRecord((prev) => ({ ...prev, ...initialValue }));
  }, [initialValue]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={record}
      onSubmit={(values, { resetForm }) => {
        handleSubmit(values);
        resetForm();
      }}
    >
      <Form className={classes.fullWidth}>
        <Grid spacing={2} container>
          <Grid item xs={12} sm={6} md={3}>
            <Field
              as={TextField}
              label="Nome"
              name="name"
              variant="outlined"
              className={classes.fullWidth}
              margin="dense"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Field
              as={TextField}
              label="Slug"
              name="slug"
              variant="outlined"
              className={classes.fullWidth}
              margin="dense"
              placeholder="ex: lanchonetes"
              helperText="Identificador único (deixe vazio para gerar)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Field
              as={TextField}
              label="Preço (R$)"
              name="price"
              type="number"
              variant="outlined"
              className={classes.fullWidth}
              margin="dense"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          {record.id && (
            <Grid item xs={12} sm={6} md={2}>
              <FormControlLabel
                control={
                  <Field name="isActive">
                    {({ field, form }) => (
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => form.setFieldValue("isActive", e.target.checked)}
                        color="primary"
                      />
                    )}
                  </Field>
                }
                label="Ativo"
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Field
              as={TextField}
              label="Descrição"
              name="description"
              variant="outlined"
              className={classes.fullWidth}
              margin="dense"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item>
                <ButtonWithSpinner
                  loading={loading}
                  onClick={onCancel}
                  variant="contained"
                >
                  Limpar
                </ButtonWithSpinner>
              </Grid>
              {record.id && (
                <Grid item>
                  <ButtonWithSpinner
                    loading={loading}
                    onClick={onDelete}
                    variant="contained"
                    color="secondary"
                  >
                    Excluir
                  </ButtonWithSpinner>
                </Grid>
              )}
              <Grid item>
                <ButtonWithSpinner
                  loading={loading}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Salvar
                </ButtonWithSpinner>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}

function ModulesManagerGrid({ records, onSelect }) {
  const classes = useStyles();

  const formatPrice = (value) => {
    if (value == null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Paper className={classes.tableContainer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" style={{ width: "1%" }}>
              #
            </TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell align="right">Preço</TableCell>
            <TableCell align="center">Ativo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row) => (
            <TableRow key={row.id}>
              <TableCell align="center">
                <IconButton size="small" onClick={() => onSelect(row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>{row.name || "-"}</TableCell>
              <TableCell>{row.slug || "-"}</TableCell>
              <TableCell style={{ maxWidth: 300 }}>
                <Typography variant="body2" noWrap title={row.description}>
                  {row.description || "-"}
                </Typography>
              </TableCell>
              <TableCell align="right">{formatPrice(row.price)}</TableCell>
              <TableCell align="center">
                {row.isActive ? "Sim" : "Não"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function ModulesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useModules();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await list();
      setRecords(data.modules || []);
    } catch (e) {
      toast.error("Erro ao carregar módulos");
      setRecords([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id) {
        await update(data.id, data);
      } else {
        await save(data);
      }
      await loadModules();
      handleCancel();
      toast.success("Módulo salvo com sucesso");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erro ao salvar módulo");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadModules();
      handleCancel();
      setShowConfirmDialog(false);
      toast.success("Módulo excluído com sucesso");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erro ao excluir módulo");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setRecord({
      id: undefined,
      name: "",
      slug: "",
      description: "",
      price: 0,
      isActive: true,
    });
  };

  const handleSelect = (row) => {
    setRecord({
      id: row.id,
      name: row.name || "",
      slug: row.slug || "",
      description: row.description || "",
      price: parseFloat(row.price) || 0,
      isActive: row.isActive !== false,
    });
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Typography variant="h6" gutterBottom>
        Módulos disponíveis
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
        Adicione e gerencie os módulos que podem ser atribuídos às empresas. Os módulos são recursos vendidos separadamente dos planos. Para atribuir a uma empresa, use a aba Empresas.
      </Typography>
      <Grid spacing={2} container>
        <Grid item xs={12}>
          <ModuleForm
            initialValue={record}
            onSubmit={handleSubmit}
            onDelete={() => setShowConfirmDialog(true)}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <ModulesManagerGrid records={records} onSelect={handleSelect} />
        </Grid>
      </Grid>
      <ConfirmationModal
        title="Excluir módulo"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja excluir o módulo &quot;{record.name}&quot;? Esta ação removerá o módulo de todas as empresas.
      </ConfirmationModal>
    </Paper>
  );
}
