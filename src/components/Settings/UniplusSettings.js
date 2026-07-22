import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  makeStyles,
  Grid,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import useSettings from "../../hooks/useSettings";
import toastError from "../../errors/toastError";

const DEFAULT_PAYMENT_MAP = {
  pix: "valorpix",
  dinheiro: "valordinheiro",
  cartao: "valorcartao",
  outro: "valoroutros",
};

const UNIPLUS_PAYMENT_COLUMNS = [
  { value: "valorpix", label: "PIX (valorpix)" },
  { value: "valordinheiro", label: "Dinheiro (valordinheiro)" },
  { value: "valorcartao", label: "Cartão (valorcartao)" },
  { value: "valorcarteiradigital", label: "Carteira digital" },
  { value: "valoroutros", label: "Outros (valoroutros)" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  helper: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
}));

function parsePaymentMap(raw) {
  try {
    const parsed = JSON.parse(raw || "{}");
    return { ...DEFAULT_PAYMENT_MAP, ...parsed };
  } catch {
    return { ...DEFAULT_PAYMENT_MAP };
  }
}

export default function UniplusSettings() {
  const classes = useStyles();
  const { getAll, update } = useSettings();
  const [enabled, setEnabled] = useState(false);
  const [idFilial, setIdFilial] = useState("1");
  const [idUsuario, setIdUsuario] = useState("1");
  const [printDeviceId, setPrintDeviceId] = useState("");
  const [paymentMap, setPaymentMap] = useState(DEFAULT_PAYMENT_MAP);
  const [devices, setDevices] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getAll();
        const list = Array.isArray(settings) ? settings : [];
        const get = (key) => list.find((s) => s.key === key)?.value ?? "";
        setEnabled(get("uniplusEnabled") === "enabled");
        setIdFilial(get("uniplusIdFilial") || "1");
        setIdUsuario(get("uniplusIdUsuario") || "1");
        setPrintDeviceId(get("uniplusPrintDeviceId") || "");
        setPaymentMap(parsePaymentMap(get("uniplusPaymentMap")));
      } catch (err) {
        toastError(err);
      }
      try {
        const { data } = await api.get("/print-devices");
        setDevices(data || []);
      } catch (err) {
        /* ignore */
      }
    })();
  }, []);

  const saveKey = async (key, value) => {
    setSaving(true);
    try {
      await update({ key, value });
      toast.success("Configuração UniPlus salva");
    } catch (err) {
      toastError(err);
    }
    setSaving(false);
  };

  const handleToggle = async (checked) => {
    setEnabled(checked);
    await saveKey("uniplusEnabled", checked ? "enabled" : "disabled");
  };

  const handlePaymentChange = async (method, column) => {
    const next = { ...paymentMap, [method]: column };
    setPaymentMap(next);
    await saveKey("uniplusPaymentMap", JSON.stringify(next));
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h6" gutterBottom>
        Integração UniPlus Gourmet
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
        Envia pedidos de delivery para o PrintAgent gravar em CONTAMESA/CONTAMESAITEM
        no banco local do UniPlus (conta aberta para faturar depois).
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={saving}
            color="primary"
          />
        }
        label="Ativar integração UniPlus"
      />

      {enabled && (
        <Grid container spacing={2} style={{ marginTop: 8 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              className={classes.field}
              label="ID Filial UniPlus"
              fullWidth
              variant="outlined"
              size="small"
              value={idFilial}
              onChange={(e) => setIdFilial(e.target.value)}
              onBlur={() => saveKey("uniplusIdFilial", idFilial)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              className={classes.field}
              label="ID Usuário UniPlus"
              fullWidth
              variant="outlined"
              size="small"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              onBlur={() => saveKey("uniplusIdUsuario", idUsuario)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              className={classes.field}
              select
              label="PrintDevice UniPlus"
              fullWidth
              variant="outlined"
              size="small"
              value={printDeviceId}
              onChange={(e) => {
                setPrintDeviceId(e.target.value);
                saveKey("uniplusPrintDeviceId", String(e.target.value));
              }}
            >
              <MenuItem value="">
                <em>Selecione</em>
              </MenuItem>
              {devices.map((d) => (
                <MenuItem key={d.id} value={String(d.id)}>
                  {d.name} ({d.deviceId})
                </MenuItem>
              ))}
            </TextField>
            <Typography className={classes.helper}>
              Mesmo agente de impressão; ele processará o evento uniplus_job.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Mapeamento de meios de pagamento
            </Typography>
          </Grid>
          {["pix", "dinheiro", "cartao", "outro"].map((method) => (
            <Grid item xs={12} sm={6} key={method}>
              <TextField
                select
                label={`Compuchat: ${method}`}
                fullWidth
                variant="outlined"
                size="small"
                value={paymentMap[method] || "valoroutros"}
                onChange={(e) => handlePaymentChange(method, e.target.value)}
              >
                {UNIPLUS_PAYMENT_COLUMNS.map((col) => (
                  <MenuItem key={col.value} value={col.value}>
                    {col.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
