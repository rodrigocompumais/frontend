import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import TableChartIcon from "@material-ui/icons/TableChart";
import { QrCode2 as QrCodeIcon } from "@mui/icons-material";
import QRCode from "qrcode.react";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import MesaCard from "../../components/MesaCard";
import MesaModal from "../../components/MesaModal";
import MesaOcuparModal from "../../components/MesaOcuparModal";
import MesaBulkCreateModal from "../../components/MesaBulkCreateModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.fancyBackground || theme.palette.background.default,
    overflow: "auto",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  filterControl: {
    minWidth: 160,
  },
  grid: {
    marginTop: theme.spacing(2),
    flex: 1,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  cardapioBanner: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    background: theme.palette.type === "dark" ? "rgba(34, 197, 94, 0.12)" : "rgba(34, 197, 94, 0.08)",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
  },
}));

const Mesas = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const socketManager = useContext(SocketContext);

  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [mesaModalOpen, setMesaModalOpen] = useState(false);
  const [mesaBulkModalOpen, setMesaBulkModalOpen] = useState(false);
  const [ocuparModalOpen, setOcuparModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [mesaToDelete, setMesaToDelete] = useState(null);
  const [cardapioQRModalOpen, setCardapioQRModalOpen] = useState(false);
  const cardapioQRRef = useRef(null);

  const fetchMesas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sectionFilter) params.section = sectionFilter;
      const { data } = await api.get("/mesas", { params });
      setMesas(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
      setMesas([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sectionFilter]);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  useEffect(() => {
    if (hasLanchonetes) {
      fetchMesas();
    }
  }, [hasLanchonetes, fetchMesas]);

  useEffect(() => {
    const socket = user?.companyId ? socketManager?.getSocket?.(user.companyId) : null;
    if (!socket) return;
    socket.on(`company-${user.companyId}-mesa`, (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "ocupar" || data.action === "liberar") {
        const mesa = data.mesa;
        setMesas((prev) => {
          const idx = prev.findIndex((m) => m.id === mesa.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = mesa;
            return updated;
          }
          return [mesa, ...prev];
        });
      }
      if (data.action === "delete") {
        setMesas((prev) => prev.filter((m) => m.id !== data.mesaId));
      }
      if (data.action === "bulkCreate") {
        setMesas((prev) => [...(data.mesas || []), ...prev]);
      }
    });
    return () => {
      socket.off(`company-${user.companyId}-mesa`);
    };
  }, [socketManager, user?.companyId]);

  const handleOpenMesaModal = (mesa = null) => {
    setSelectedMesa(mesa);
    setMesaModalOpen(true);
  };

  const handleCloseMesaModal = () => {
    setMesaModalOpen(false);
    setSelectedMesa(null);
    fetchMesas();
  };

  const handleOpenBulkModal = () => setMesaBulkModalOpen(true);
  const handleCloseBulkModal = () => {
    setMesaBulkModalOpen(false);
    fetchMesas();
  };

  const handleOcupar = (mesa) => {
    setSelectedMesa(mesa);
    setOcuparModalOpen(true);
  };

  const handleLiberar = async (mesa) => {
    try {
      await api.put(`/mesas/${mesa.id}/liberar`);
      toast.success("Mesa liberada");
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  const handleVerTicket = (mesa) => {
    if (mesa?.ticketId) {
      history.push(`/tickets/${mesa.ticketId}`);
    }
  };

  const handleEdit = (mesa) => handleOpenMesaModal(mesa);

  const handleDeleteClick = (mesa) => {
    setMesaToDelete(mesa);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mesaToDelete) return;
    try {
      await api.delete(`/mesas/${mesaToDelete.id}`);
      toast.success("Mesa removida");
      setConfirmModalOpen(false);
      setMesaToDelete(null);
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Title>Mesas</Title>
        <MainHeaderButtonsWrapper>
          <div className={classes.headerActions}>
            <FormControl size="small" className={classes.filterControl}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="livre">Livre</MenuItem>
                <MenuItem value="ocupada">Ocupada</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" className={classes.filterControl}>
              <InputLabel>Seção</InputLabel>
              <Select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                label="Seção"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="salao">Salão</MenuItem>
                <MenuItem value="varanda">Varanda</MenuItem>
                <MenuItem value="area_externa">Área externa</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMesaModal()}
            >
              Nova mesa
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenBulkModal}
            >
              Criar várias
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Box className={classes.root}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : mesas.length === 0 ? (
          <Paper className={classes.emptyState}>
            <TableChartIcon style={{ fontSize: 64, marginBottom: 16 }} />
            <Typography variant="h6">Nenhuma mesa cadastrada</Typography>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Crie mesas individuais ou em massa para começar.
            </Typography>
            <Box mt={2} display="flex" gap={1}>
              <Button variant="contained" color="primary" onClick={() => handleOpenMesaModal()}>
                Nova mesa
              </Button>
              <Button variant="outlined" onClick={handleOpenBulkModal}>
                Criar várias
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {(() => {
              const formSlug = mesas.find((m) => m.form?.slug)?.form?.slug;
              if (!formSlug) return null;
              const cardapioUrl = `${window.location.origin}/f/${formSlug}`;
              return (
                <Paper className={classes.cardapioBanner}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    Cardápio para mesas
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(cardapioUrl).then(() => toast.success("Link copiado!"));
                        }
                      }}
                    >
                      Copiar link
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<QrCodeIcon fontSize="small" />}
                      onClick={() => setCardapioQRModalOpen(true)}
                    >
                      Ver QR geral
                    </Button>
                  </Box>
                </Paper>
              );
            })()}
          <Grid container spacing={2} className={classes.grid}>
            {mesas.map((mesa) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={mesa.id}>
                <MesaCard
                  mesa={mesa}
                  onOcupar={handleOcupar}
                  onLiberar={handleLiberar}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onVerTicket={handleVerTicket}
                  onCopyLink={(url) => toast.success("Link copiado!")}
                />
              </Grid>
            ))}
          </Grid>
          </>
        )}
      </Box>

      <MesaModal
        open={mesaModalOpen}
        onClose={handleCloseMesaModal}
        mesa={selectedMesa}
        onSuccess={fetchMesas}
      />
      <MesaOcuparModal
        open={ocuparModalOpen}
        onClose={() => {
          setOcuparModalOpen(false);
          setSelectedMesa(null);
        }}
        mesa={selectedMesa}
        onSuccess={fetchMesas}
      />
      <MesaBulkCreateModal
        open={mesaBulkModalOpen}
        onClose={handleCloseBulkModal}
        onSuccess={fetchMesas}
      />
      <ConfirmationModal
        title="Excluir mesa"
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setMesaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      >
        Tem certeza que deseja excluir a mesa {mesaToDelete?.number || mesaToDelete?.name}?
      </ConfirmationModal>

      {(() => {
        const formSlug = mesas.find((m) => m.form?.slug)?.form?.slug;
        if (!formSlug) return null;
        const cardapioUrl = `${window.location.origin}/f/${formSlug}`;
        return (
          <Dialog open={cardapioQRModalOpen} onClose={() => setCardapioQRModalOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle>QR Code - Cardápio</DialogTitle>
            <DialogContent>
              <Box ref={cardapioQRRef} display="flex" flexDirection="column" alignItems="center">
                <QRCode value={cardapioUrl} size={220} level="M" renderAs="canvas" />
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, wordBreak: "break-all", textAlign: "center" }}>
                  {cardapioUrl}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(cardapioUrl).then(() => toast.success("Link copiado!"));
                  }
                }}
                color="primary"
              >
                Copiar link
              </Button>
              <Button
                onClick={() => {
                  const canvas = cardapioQRRef.current?.querySelector("canvas");
                  if (canvas) {
                    const link = document.createElement("a");
                    link.download = "qr-cardapio.png";
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }
                }}
                color="primary"
                variant="contained"
              >
                Baixar QR
              </Button>
              <Button onClick={() => setCardapioQRModalOpen(false)}>Fechar</Button>
            </DialogActions>
          </Dialog>
        );
      })()}
    </MainContainer>
  );
};

export default Mesas;
