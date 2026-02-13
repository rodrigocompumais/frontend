import React, { useState, useEffect, useContext } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Button,
  Chip,
} from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import ConfirmationModal from "../../components/ConfirmationModal";
import HelpArticleEditor from "../../components/HelpArticleEditor";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import useHelpArticles from "../../hooks/useHelpArticles";
import { AuthContext } from "../../context/Auth/AuthContext";
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
  tableContainer: {
    width: "100%",
    overflowX: "scroll",
    ...theme.scrollbarStyles,
  },
  buttonContainer: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
  },
}));

export default function HelpArticles() {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { list, save, update, remove } = useHelpArticles();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Verificar se é empresa 1
  const isCompanyOne = user?.companyId === 1;

  useEffect(() => {
    if (isCompanyOne) {
      async function fetchData() {
        await loadArticles();
      }
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompanyOne]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await list({});
      setRecords(data.records || []);
    } catch (e) {
      toast.error("Erro ao carregar artigos");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadArticles();
      handleCancel();
      toast.success("Artigo salvo com sucesso");
    } catch (e) {
      toast.error("Erro ao salvar artigo");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadArticles();
      handleCancel();
      setShowConfirmDialog(false);
      toast.success("Artigo deletado com sucesso");
    } catch (e) {
      toast.error("Erro ao deletar artigo");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setRecord(null);
    setShowForm(false);
  };

  const handleSelect = (data) => {
    setRecord(data);
    setShowForm(true);
  };

  const handleNew = () => {
    setRecord({
      title: "",
      content: "",
      summary: "",
      keywords: "",
      category: "Outros",
      order: 0,
      isActive: true,
    });
    setShowForm(true);
  };

  if (!isCompanyOne) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>Gerenciar Artigos</Title>
        </MainHeader>
        <Paper className={classes.mainPaper}>
          <p>Apenas a empresa administradora pode gerenciar artigos.</p>
        </Paper>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Gerenciar Artigos de Ajuda</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNew}
          >
            Novo Artigo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={0}>
        <Grid spacing={2} container>
          {showForm && (
            <Grid xs={12} item>
              <HelpArticleEditor
                initialValue={record}
                onDelete={() => setShowConfirmDialog(true)}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
              />
            </Grid>
          )}
          <Grid xs={12} item>
            <Paper className={classes.tableContainer}>
              <Table className={classes.fullWidth} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" style={{ width: "1%" }}>
                      Ações
                    </TableCell>
                    <TableCell align="left">Título</TableCell>
                    <TableCell align="left">Categoria</TableCell>
                    <TableCell align="center">Ordem</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="left">Palavras-chave</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length > 0 ? (
                    records.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell align="center" style={{ width: "1%" }}>
                          <IconButton
                            onClick={() => handleSelect(row)}
                            aria-label="edit"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setRecord(row);
                              setShowConfirmDialog(true);
                            }}
                            aria-label="delete"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="left">{row.title || "-"}</TableCell>
                        <TableCell align="left">
                          {row.category ? (
                            <Chip label={row.category} size="small" color="primary" />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="center">{row.order || 0}</TableCell>
                        <TableCell align="center">
                          {row.isActive ? (
                            <Chip label="Ativo" size="small" color="primary" />
                          ) : (
                            <Chip label="Inativo" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="left">
                          {row.keywords
                            ? row.keywords
                                .split(",")
                                .slice(0, 3)
                                .map((k, idx) => (
                                  <Chip
                                    key={idx}
                                    label={k.trim()}
                                    size="small"
                                    variant="outlined"
                                    style={{ marginRight: 4 }}
                                  />
                                ))
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum artigo encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
        <ConfirmationModal
          title="Confirmar exclusão"
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleDelete}
        >
          Tem certeza que deseja excluir este artigo?
        </ConfirmationModal>
      </Paper>
    </MainContainer>
  );
}
