import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GetAppIcon from "@material-ui/icons/GetApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import BarChartIcon from "@material-ui/icons/BarChart";
import CloseIcon from "@material-ui/icons/Close";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(1),
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    marginBottom: theme.spacing(2),
  },
  summaryChips: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    maxHeight: "55vh",
    overflowY: "auto",
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    background: theme.palette.background.paper,
    zIndex: 1,
  },
  rankCell: {
    width: 40,
    color: theme.palette.text.disabled,
    fontWeight: 700,
  },
  totalRow: {
    background:
      theme.palette.type === "dark"
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.03)",
    "& td": { fontWeight: 700 },
  },
  emptyState: {
    padding: theme.spacing(5),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const today = () => new Date().toISOString().slice(0, 10);

const RelatorioProdutosModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchRelatorio = useCallback(
    async (sd = startDate, ed = endDate) => {
      setLoading(true);
      try {
        const { data } = await api.get("/pdv/relatorio-produtos", {
          params: { startDate: sd, endDate: ed },
        });
        setResult(data);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate]
  );

  const handleOpen = () => {
    // Ao abrir, busca automaticamente com a data de hoje
    if (!result) fetchRelatorio();
  };

  React.useEffect(() => {
    if (open) handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleExportCSV = () => {
    if (!result || !result.produtos.length) return;
    const header = "Produto,Quantidade,Valor Unitário,Total\n";
    const rows = result.produtos
      .map(
        (p) =>
          `"${p.productName}",${p.quantity},${p.unitValue.toFixed(2)},${p.total.toFixed(2)}`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-produtos-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Box display="flex" alignItems="center">
          <BarChartIcon className={classes.titleIcon} />
          <Typography variant="h6" style={{ fontWeight: 700 }}>
            Relatório de Movimentação de Produtos
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Filtros */}
        <div className={classes.filterRow}>
          <TextField
            label="Data inicial"
            type="date"
            size="small"
            variant="outlined"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ minWidth: 160 }}
          />
          <TextField
            label="Data final"
            type="date"
            size="small"
            variant="outlined"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ minWidth: 160 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={() => fetchRelatorio(startDate, endDate)}
            disabled={loading || !startDate || !endDate}
            style={{ textTransform: "none", borderRadius: 8 }}
          >
            {loading ? "Carregando…" : "Buscar"}
          </Button>
          {result && result.produtos.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={handleExportCSV}
              style={{ textTransform: "none", borderRadius: 8 }}
            >
              Exportar CSV
            </Button>
          )}
        </div>

        {/* Resumo */}
        {result && !loading && (
          <div className={classes.summaryChips}>
            <Chip
              label={`${result.produtos.length} produto${result.produtos.length !== 1 ? "s" : ""}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${result.totalItens} unidades vendidas`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Total: R$ ${Number(result.totalGeral || 0).toFixed(2)}`}
              size="small"
              color="primary"
            />
          </div>
        )}

        <Divider style={{ marginBottom: 12 }} />

        {/* Tabela */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : !result ? null : result.produtos.length === 0 ? (
          <div className={classes.emptyState}>
            <Typography variant="body1">
              Nenhum produto vendido neste período.
            </Typography>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0} variant="outlined" className={classes.tableContainer}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={`${classes.stickyHeader} ${classes.rankCell}`}>#</TableCell>
                  <TableCell className={classes.stickyHeader} style={{ fontWeight: 700 }}>
                    Produto
                  </TableCell>
                  <TableCell className={classes.stickyHeader} align="right" style={{ fontWeight: 700 }}>
                    Qtd
                  </TableCell>
                  <TableCell className={classes.stickyHeader} align="right" style={{ fontWeight: 700 }}>
                    Val. Unit.
                  </TableCell>
                  <TableCell className={classes.stickyHeader} align="right" style={{ fontWeight: 700 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.produtos.map((p, idx) => (
                  <TableRow key={`${p.productName}-${idx}`} hover>
                    <TableCell className={classes.rankCell}>{idx + 1}</TableCell>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell align="right">
                      <strong>{p.quantity}</strong>
                    </TableCell>
                    <TableCell align="right">
                      {p.unitValue > 0 ? `R$ ${p.unitValue.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {p.total > 0 ? `R$ ${p.total.toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Linha de totais */}
                <TableRow className={classes.totalRow}>
                  <TableCell />
                  <TableCell>Total geral</TableCell>
                  <TableCell align="right">{result.totalItens}</TableCell>
                  <TableCell />
                  <TableCell align="right">R$ {Number(result.totalGeral || 0).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} style={{ textTransform: "none" }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RelatorioProdutosModal;
