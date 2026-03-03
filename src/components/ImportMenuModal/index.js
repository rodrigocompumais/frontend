import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CheckIcon from "@material-ui/icons/Check";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  uploadZone: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: "center",
    cursor: "pointer",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  },
  tableWrapper: {
    maxHeight: 400,
    overflow: "auto",
  },
  inputCell: {
    padding: theme.spacing(0.5),
    "& input": {
      fontSize: "0.875rem",
    },
  },
  progress: {
    margin: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
  },
  progressList: {
    marginTop: theme.spacing(2),
    textAlign: "left",
    maxHeight: 200,
    overflowY: "auto",
  },
  progressItem: {
    padding: theme.spacing(0.5, 0),
    fontSize: "0.875rem",
    color: theme.palette.primary.main,
  },
  adicionaisSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  adicionaisCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}));

const ImportMenuModal = ({ open, onClose, onSuccess }) => {
  const classes = useStyles();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState(null);
  const [produtos, setProdutos] = useState([]);
  /** Mensagens de progresso visual (ex.: "Página 1 extraída", "Página 2 extraída") */
  const [progressMessages, setProgressMessages] = useState([]);

  const handleClose = () => {
    setStep(1);
    setPreview(null);
    setProdutos([]);
    setProgressMessages([]);
    setLoading(false);
    setConfirming(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Use um arquivo PDF ou imagem (JPEG, PNG, GIF, WEBP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 20MB.");
      return;
    }

    setLoading(true);
    setProgressMessages([]);
    const formData = new FormData();
    formData.append("file", file);
    const isPdf = file.type === "application/pdf";

    try {
      if (isPdf) {
        const baseURL = api.defaults.baseURL || "";
        const url = `${baseURL.replace(/\/$/, "")}/products/import-from-menu`;
        let token;
        try {
          const raw = localStorage.getItem("token");
          token = raw ? JSON.parse(raw) : null;
        } catch {
          token = null;
        }
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(url, {
          method: "POST",
          body: formData,
          credentials: "include",
          headers,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.message || `Erro ${res.status}`);
          return;
        }
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("text/event-stream")) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const payload = JSON.parse(line.slice(6));
                  if (payload.event === "page") {
                    setProgressMessages((prev) => [
                      ...prev,
                      `Página ${payload.page} extraída`,
                    ]);
                  } else if (payload.event === "done") {
                    const prev = payload.preview || {};
                    setPreview(prev);
                    setProdutos(Array.isArray(prev.produtos) ? prev.produtos : []);
                    setStep(2);
                  } else if (payload.event === "error") {
                    toast.error(payload.message || "Erro ao processar o cardápio.");
                  }
                } catch (_) {}
              }
            }
          }
        } else {
          const data = await res.json().catch(() => ({}));
          const prev = data.preview || {};
          setPreview(prev);
          setProdutos(Array.isArray(prev.produtos) ? prev.produtos : []);
          setStep(2);
        }
      } else {
        const { data } = await api.post("/products/import-from-menu", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const prev = data.preview || {};
        setPreview(prev);
        setProdutos(Array.isArray(prev.produtos) ? prev.produtos : []);
        setStep(2);
      }
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      setProgressMessages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateProduto = (index, field, value) => {
    setProdutos((prev) => {
      const next = [...prev];
      if (!next[index]) return next;
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleConfirmImport = async () => {
    const toSend = produtos.filter(
      (p) => p.nome && String(p.nome).trim() && (typeof p.valor === "number" ? p.valor >= 0 : parseFloat(String(p.valor).replace(",", ".")) >= 0)
    ).map((p) => ({
      nome: String(p.nome).trim(),
      descricao: p.descricao ? String(p.descricao).trim() : undefined,
      grupo: (p.grupo && String(p.grupo).trim()) || "Outros",
      valor: typeof p.valor === "number" ? p.valor : parseFloat(String(p.valor).replace(",", ".")) || 0,
    }));

    if (toSend.length === 0) {
      toast.error("Adicione ao menos um produto válido (nome e valor).");
      return;
    }

    setConfirming(true);
    try {
      const adicionaisToSend = Array.isArray(preview?.adicionais) ? preview.adicionais : [];
      const { data } = await api.post("/products/import-from-menu/confirm", {
        produtos: toSend,
        adicionais: adicionaisToSend,
      });
      const addOnMsg = adicionaisToSend.length > 0 ? ` e ${adicionaisToSend.length} grupo(s) de adicionais` : "";
      toast.success(`${data.count || 0} produto(s) importado(s)${addOnMsg} com sucesso.`);
      if (typeof onSuccess === "function") onSuccess();
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setConfirming(false);
    }
  };

  const title =
    step === 1
      ? "Importar do cardápio"
      : "Revisar e confirmar importação";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {step === 1 && (
          <>
            <Typography color="textSecondary" gutterBottom>
              Envie uma foto ou PDF do cardápio. A IA extrairá produtos, grupos e valores.
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Box
              className={classes.uploadZone}
              onClick={() => fileInputRef.current?.click()}
            >
              {loading ? (
                <>
                  <div className={classes.progress}>
                    <CircularProgress />
                    <Typography style={{ marginLeft: 8 }}>
                      {progressMessages.length > 0
                        ? `Processando... (${progressMessages.length} página(s))`
                        : "Analisando cardápio..."}
                    </Typography>
                  </div>
                  {progressMessages.length > 0 && (
                    <div className={classes.progressList}>
                      {progressMessages.map((msg, i) => (
                        <Typography key={i} className={classes.progressItem}>
                          {msg}
                        </Typography>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <CloudUploadIcon style={{ fontSize: 48 }} />
                  <Typography>Clique ou arraste PDF ou imagem (até 20MB)</Typography>
                </>
              )}
            </Box>
          </>
        )}

        {step === 2 && (
          <>
            <Typography color="textSecondary" gutterBottom>
              Revise os produtos extraídos. Edite se necessário e confirme para criar no cardápio.
            </Typography>
            {preview?.totalPages != null && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {preview.processedPages != null
                  ? `Processadas ${preview.processedPages} de ${preview.totalPages} página(s).`
                  : `PDF com ${preview.totalPages} página(s).`}
              </Typography>
            )}
            {preview?.partial && preview?.pageErrors?.length > 0 && (
              <Box mb={1} p={1} bgcolor="action.hover" borderRadius={4}>
                <Typography variant="body2" color="textSecondary">
                  Algumas páginas não puderam ser lidas:
                </Typography>
                <Typography component="ul" variant="body2" color="textSecondary" style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                  {preview.pageErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </Typography>
              </Box>
            )}
            {Array.isArray(preview?.adicionais) && preview.adicionais.length > 0 && (
              <div className={classes.adicionaisSection}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Grupos de adicionais (serão criados e vinculados às categorias)
                </Typography>
                {preview.adicionais.map((ad, idx) => (
                  <div key={idx} className={classes.adicionaisCard}>
                    <Typography variant="body2" fontWeight="bold">
                      {ad.nomeGrupo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {ad.itens?.map((it) => `${it.label} (R$ ${Number(it.valor).toFixed(2)})`).join(", ")}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Aplicado a: {ad.gruposProduto?.join(", ") || "—"}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
            <div className={classes.tableWrapper}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Grupo</TableCell>
                    <TableCell align="right">Valor (R$)</TableCell>
                    <TableCell>Descrição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produtos.map((p, index) => (
                    <TableRow key={index}>
                      <TableCell className={classes.inputCell}>
                        <TextField
                          fullWidth
                          size="small"
                          value={p.nome || ""}
                          onChange={(e) => updateProduto(index, "nome", e.target.value)}
                          placeholder="Nome"
                        />
                      </TableCell>
                      <TableCell className={classes.inputCell}>
                        <TextField
                          fullWidth
                          size="small"
                          value={p.grupo || ""}
                          onChange={(e) => updateProduto(index, "grupo", e.target.value)}
                          placeholder="Outros"
                        />
                      </TableCell>
                      <TableCell className={classes.inputCell} align="right">
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          value={p.valor ?? ""}
                          onChange={(e) =>
                            updateProduto(
                              index,
                              "valor",
                              e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          style={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell className={classes.inputCell}>
                        <TextField
                          fullWidth
                          size="small"
                          value={p.descricao || ""}
                          onChange={(e) => updateProduto(index, "descricao", e.target.value)}
                          placeholder="Opcional"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {produtos.length === 0 && (
              <Typography color="textSecondary">
                Nenhum produto extraído. Tente outro arquivo.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {step === 2 && (
          <>
            <Button onClick={() => setStep(1)} color="default" disabled={confirming}>
              Voltar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmImport}
              disabled={confirming || produtos.length === 0}
              startIcon={confirming ? <CircularProgress size={16} /> : <CheckIcon />}
            >
              {confirming ? "Importando..." : "Confirmar importação"}
            </Button>
          </>
        )}
        {step === 1 && (
          <Button onClick={handleClose} color="default">
            Fechar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportMenuModal;
