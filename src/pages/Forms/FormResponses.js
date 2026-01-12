import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  makeStyles,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import VisibilityIcon from "@material-ui/icons/Visibility";
import DeleteIcon from "@material-ui/icons/Delete";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import GetAppIcon from "@material-ui/icons/GetApp";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";

import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  statusChip: {
    fontWeight: 600,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
  responseDetail: {
    padding: theme.spacing(2),
  },
  fieldAnswer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.05)" 
      : "rgba(0, 0, 0, 0.02)",
    borderRadius: theme.shape.borderRadius,
  },
  fieldLabel: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.primary,
  },
  fieldValue: {
    color: theme.palette.text.secondary,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    color: "white",
    "&:hover": {
      backgroundColor: "#20BA5A",
    },
  },
}));

const FormResponses = () => {
  const classes = useStyles();
  const { formId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuResponse, setMenuResponse] = useState(null);

  useEffect(() => {
    loadForm();
    loadResponses();
  }, [formId]);

  const loadForm = async () => {
    try {
      const { data } = await api.get(`/forms/${formId}`);
      setForm(data);
    } catch (err) {
      toastError(err);
      history.push("/forms");
    }
  };

  const loadResponses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/forms/${formId}/responses`);
      setResponses(data.responses || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (response) => {
    try {
      const { data } = await api.get(`/forms/${formId}/responses/${response.id}`);
      setSelectedResponse(data);
      setDetailModalOpen(true);
      
      // Marcar como lida se não estiver lida
      if (!data.isRead) {
        await api.put(`/forms/${formId}/responses/${response.id}/read`);
        loadResponses();
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleToggleStar = async (response) => {
    try {
      await api.put(`/forms/${formId}/responses/${response.id}/star`);
      loadResponses();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async (responseId) => {
    try {
      await api.delete(`/forms/${formId}/responses/${responseId}`);
      toast.success("Resposta excluída com sucesso!");
      loadResponses();
      setDetailModalOpen(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/forms/${formId}/export`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `formulario-${form?.slug || formId}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Dados exportados com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleWhatsApp = async (response) => {
    if (!response.responderPhone) {
      toast.error("Número de telefone não disponível");
      return;
    }

    const message = form?.settings?.whatsAppMessage || "";
    if (!message.trim()) {
      toast.error("Mensagem pré-definida não configurada no formulário");
      return;
    }

    try {
      // Limpar número (remover caracteres não numéricos)
      const phoneNumber = response.responderPhone.replace(/\D/g, "");

      // Usar o novo endpoint que cria contato e ticket automaticamente
      await api.post("/messages/send-by-phone", {
        number: phoneNumber,
        body: message,
      });

      toast.success("Mensagem enviada com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleMenuOpen = (event, response) => {
    setAnchorEl(event.currentTarget);
    setMenuResponse(response);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuResponse(null);
  };

  const getFieldAnswer = (fieldId) => {
    if (!selectedResponse?.answers) return "";
    const answer = selectedResponse.answers.find((a) => a.fieldId === fieldId);
    return answer?.answer || "";
  };

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => history.push("/forms")}>
            <ArrowBackIcon />
          </IconButton>
          <Title>
            {form?.name || "Formulário"} - Respostas
          </Title>
        </Box>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleExport}
          >
            Exportar Excel
          </Button>
          <Button
            variant="outlined"
            onClick={() => history.push(`/forms/${formId}/analytics`)}
          >
            Ver Analytics
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Status</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <>
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
              </>
            )}
            {!loading && responses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma resposta encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              responses.map((response) => (
                <TableRow key={response.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {response.isRead ? (
                        <CheckCircleIcon fontSize="small" color="action" />
                      ) : (
                        <RadioButtonUncheckedIcon fontSize="small" color="primary" />
                      )}
                      {response.isStarred && (
                        <StarIcon fontSize="small" color="warning" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      {response.responderName || "Sem nome"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {response.responderPhone ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {response.responderPhone}
                        </Typography>
                        <IconButton
                          size="small"
                          className={classes.whatsappButton}
                          onClick={() => handleWhatsApp(response)}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {response.responderEmail || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(response.submittedAt), "dd/MM/yyyy HH:mm")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box className={classes.actionButtons}>
                      <Tooltip title="Ver detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(response)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={response.isStarred ? "Remover estrela" : "Marcar com estrela"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStar(response)}
                        >
                          {response.isStarred ? (
                            <StarIcon fontSize="small" color="warning" />
                          ) : (
                            <StarBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, response)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuResponse && (
          <>
            <MenuItem
              onClick={() => {
                handleDelete(menuResponse.id);
                handleMenuClose();
              }}
            >
              <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
              Excluir
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Modal de detalhes */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Detalhes da Resposta</Typography>
            {selectedResponse && (
              <Box display="flex" gap={1}>
                {selectedResponse.responderPhone && (
                  <IconButton
                    size="small"
                    className={classes.whatsappButton}
                    onClick={() => handleWhatsApp(selectedResponse)}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => {
                    if (selectedResponse) {
                      handleToggleStar(selectedResponse);
                      setSelectedResponse({
                        ...selectedResponse,
                        isStarred: !selectedResponse.isStarred,
                      });
                    }
                  }}
                >
                  {selectedResponse?.isStarred ? (
                    <StarIcon color="warning" />
                  ) : (
                    <StarBorderIcon />
                  )}
                </IconButton>
              </Box>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedResponse && (
            <Box className={classes.responseDetail}>
              <Box marginBottom={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Informações do Respondente
                </Typography>
                <Box className={classes.fieldAnswer}>
                  <Typography className={classes.fieldLabel}>Nome</Typography>
                  <Typography className={classes.fieldValue}>
                    {selectedResponse.responderName || "Não informado"}
                  </Typography>
                </Box>
                <Box className={classes.fieldAnswer}>
                  <Typography className={classes.fieldLabel}>Telefone</Typography>
                  <Typography className={classes.fieldValue}>
                    {selectedResponse.responderPhone || "Não informado"}
                  </Typography>
                </Box>
                <Box className={classes.fieldAnswer}>
                  <Typography className={classes.fieldLabel}>Email</Typography>
                  <Typography className={classes.fieldValue}>
                    {selectedResponse.responderEmail || "Não informado"}
                  </Typography>
                </Box>
                <Box className={classes.fieldAnswer}>
                  <Typography className={classes.fieldLabel}>Data de Envio</Typography>
                  <Typography className={classes.fieldValue}>
                    {format(
                      new Date(selectedResponse.submittedAt),
                      "dd/MM/yyyy 'às' HH:mm"
                    )}
                  </Typography>
                </Box>
              </Box>

              <Divider style={{ marginBottom: 24, marginTop: 24 }} />

              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Respostas
              </Typography>
              {form?.fields
                ?.sort((a, b) => a.order - b.order)
                .map((field) => {
                  const answer = getFieldAnswer(field.id);
                  if (!answer) return null;
                  
                  return (
                    <Box key={field.id} className={classes.fieldAnswer}>
                      <Typography className={classes.fieldLabel}>
                        {field.label}
                        {field.isRequired && (
                          <Chip
                            label="Obrigatório"
                            size="small"
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </Typography>
                      <Typography className={classes.fieldValue}>
                        {answer}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Fechar</Button>
          {selectedResponse && (
            <Button
              color="secondary"
              onClick={() => {
                handleDelete(selectedResponse.id);
              }}
              startIcon={<DeleteIcon />}
            >
              Excluir
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default FormResponses;
