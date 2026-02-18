import React, { useState, useEffect, useCallback } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MDEditor from "@uiw/react-md-editor";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  // Função para fazer upload de imagem
  const uploadImage = useCallback(async (file) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/help-articles/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.url;
      return imageUrl;
    } catch (err) {
      toastError(err);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  }, []);

  // Função para inserir imagem no markdown com tamanho
  const insertImageMarkdown = useCallback((imageUrl, width = null, height = null) => {
    let imageMarkdown = "";
    
    if (width || height) {
      // Usar HTML para controlar tamanho
      const style = [];
      if (width) style.push(`width: ${width}px`);
      if (height) style.push(`height: ${height}px`);
      imageMarkdown = `<img src="${imageUrl}" style="${style.join('; ')}" alt="Imagem" />`;
    } else {
      // Markdown padrão
      imageMarkdown = `![Imagem](${imageUrl})`;
    }

    return imageMarkdown;
  }, []);

  // Adicionar event listener para paste global no editor
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      // Verificar se o evento está dentro do editor
      const target = e.target;
      const isInEditor = target.closest('.w-md-editor') || target.closest('.w-md-editor-text-input');
      
      if (!isInEditor) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          
          if (file) {
            try {
              const imageUrl = await uploadImage(file);
              const imageMarkdown = insertImageMarkdown(imageUrl);
              
              // Inserir imagem no final do conteúdo atual
              setMarkdownContent(prev => prev + "\n\n" + imageMarkdown + "\n\n");
              toast.success("Imagem inserida com sucesso!");
            } catch (err) {
              toast.error("Erro ao fazer upload da imagem");
            }
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [uploadImage, insertImageMarkdown]);


  // Função para inserir imagem com tamanho customizado
  const handleInsertImage = async (file, width = null, height = null) => {
    try {
      const imageUrl = await uploadImage(file);
      const imageMarkdown = insertImageMarkdown(imageUrl, width, height);
      
      const cursorPos = markdownContent.length;
      const newContent = markdownContent + "\n\n" + imageMarkdown + "\n\n";
      setMarkdownContent(newContent);
      toast.success("Imagem inserida com sucesso!");
    } catch (err) {
      toast.error("Erro ao fazer upload da imagem");
    }
  };

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
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "block" }}>
                    Conteúdo (Markdown)
                  </label>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-upload-input"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Prompt para tamanho
                        const width = prompt("Largura da imagem em pixels (deixe vazio para automático):");
                        const height = prompt("Altura da imagem em pixels (deixe vazio para automático):");
                        handleInsertImage(
                          file,
                          width ? parseInt(width) : null,
                          height ? parseInt(height) : null
                        );
                      }
                      e.target.value = "";
                    }}
                  />
                  <label htmlFor="image-upload-input">
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={uploadingImage}
                      component="span"
                      style={{ marginLeft: 8 }}
                    >
                      {uploadingImage ? "Enviando..." : "Inserir Imagem"}
                    </Button>
                  </label>
                </div>
                <div style={{ position: "relative" }}>
                  <MDEditor
                    value={markdownContent}
                    onChange={setMarkdownContent}
                    preview="edit"
                    height={400}
                    data-color-mode="light"
                  />
                </div>
                <div style={{ marginTop: 8, fontSize: "0.875rem", color: "#666" }}>
                  💡 Dica: Você pode colar imagens diretamente com Ctrl+V ou usar o botão "Inserir Imagem" para definir tamanho customizado.
                  <br />
                  Para ajustar tamanho de imagens já inseridas, edite o HTML: &lt;img src="url" style="width: 500px; height: 300px;" /&gt;
                </div>
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
