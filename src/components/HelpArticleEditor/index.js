import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MDEditor from "@uiw/react-md-editor";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    padding: theme.spacing(2),
  },
  fullWidth: {
    width: "100%",
  },
  textfield: {
    width: "100%",
  },
  editorContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "flex-end",
  },
}));

const CATEGORIES = [
  "Configuração",
  "Campanhas",
  "Tickets",
  "Contatos",
  "Integrações",
  "Relatórios",
  "Outros",
];

const HelpArticleEditor = ({ onSubmit, onCancel, initialValue, loading }) => {
  const classes = useStyles();
  const [record, setRecord] = useState(initialValue || {
    title: "",
    content: "",
    summary: "",
    keywords: "",
    category: "Outros",
    order: 0,
    isActive: true,
  });
  const [markdownContent, setMarkdownContent] = useState(initialValue?.content || "");

  useEffect(() => {
    if (initialValue) {
      setRecord(initialValue);
      setMarkdownContent(initialValue.content || "");
    }
  }, [initialValue]);

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      content: markdownContent,
    };
    onSubmit(data);
  };

  return (
    <Formik
      enableReinitialize
      className={classes.fullWidth}
      initialValues={record}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className={classes.fullWidth}>
          <Grid spacing={2} container>
            <Grid xs={12} item>
              <Field
                as={TextField}
                label="Título"
                name="title"
                variant="outlined"
                className={classes.fullWidth}
                margin="dense"
                required
              />
            </Grid>

            <Grid xs={12} sm={6} item>
              <Field
                as={TextField}
                select
                label="Categoria"
                name="category"
                variant="outlined"
                className={classes.fullWidth}
                margin="dense"
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Field>
            </Grid>

            <Grid xs={12} sm={6} item>
              <Field
                as={TextField}
                label="Ordem de Exibição"
                name="order"
                type="number"
                variant="outlined"
                className={classes.fullWidth}
                margin="dense"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid xs={12} item>
              <TextField
                label="Resumo"
                name="summary"
                variant="outlined"
                className={classes.fullWidth}
                margin="dense"
                multiline
                rows={2}
                value={values.summary}
                onChange={(e) => setFieldValue("summary", e.target.value)}
              />
            </Grid>

            <Grid xs={12} item>
              <TextField
                label="Palavras-chave (separadas por vírgula)"
                name="keywords"
                variant="outlined"
                className={classes.fullWidth}
                margin="dense"
                placeholder="ex: ajuda, tutorial, configuração"
                value={values.keywords}
                onChange={(e) => setFieldValue("keywords", e.target.value)}
              />
            </Grid>

            <Grid xs={12} item>
              <div className={classes.editorContainer}>
                <label style={{ marginBottom: 8, display: "block" }}>
                  Conteúdo (Markdown)
                </label>
                <MDEditor
                  value={markdownContent}
                  onChange={setMarkdownContent}
                  preview="edit"
                  height={400}
                />
              </div>
            </Grid>

            <Grid xs={12} item>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.isActive}
                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>

            <Grid xs={12} item>
              <div className={classes.buttonContainer}>
                <ButtonWithSpinner
                  className={classes.fullWidth}
                  loading={loading}
                  onClick={onCancel}
                  variant="contained"
                  style={{ maxWidth: 150 }}
                >
                  {i18n.t("settings.helps.buttons.clean") || "Cancelar"}
                </ButtonWithSpinner>
                <ButtonWithSpinner
                  className={classes.fullWidth}
                  loading={loading}
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ maxWidth: 150 }}
                >
                  {i18n.t("settings.helps.buttons.save") || "Salvar"}
                </ButtonWithSpinner>
              </div>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default HelpArticleEditor;
