import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { applyDiscount, buildDescontoPayload } from "../../helpers/gourmetOrderTotals";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  tipoGrid: {
    display: "flex",
    gap: theme.spacing(1),
  },
  tipoBtn: {
    minWidth: 56,
    fontWeight: 600,
  },
}));

function formatBrl(n) {
  return `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;
}

function tKey(prefix, key) {
  return i18n.t(`${prefix}.${key}`);
}

export default function DescontoCheckoutFields({
  subtotal,
  descontoTipo,
  setDescontoTipo,
  descontoValorInput,
  setDescontoValorInput,
  translationPrefix = "pdv.discount",
}) {
  const classes = useStyles();
  const descontoPayload = buildDescontoPayload(descontoTipo, descontoValorInput);
  const { desconto, total } = applyDiscount(subtotal, descontoPayload);

  return (
    <Box mt={2} pt={2} borderTop={1} borderColor="divider">
      <Typography variant="subtitle2" gutterBottom>
        {tKey(translationPrefix, "title")}
      </Typography>
      <Box display="flex" flexWrap="wrap" style={{ gap: 12 }} alignItems="flex-end">
        <Box>
          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
            {tKey(translationPrefix, "type")}
          </Typography>
          <Box className={classes.tipoGrid} role="group" aria-label={tKey(translationPrefix, "type")}>
            <Button
              size="small"
              variant={descontoTipo === "fixed" ? "contained" : "outlined"}
              color={descontoTipo === "fixed" ? "primary" : "default"}
              className={classes.tipoBtn}
              onClick={() => setDescontoTipo("fixed")}
            >
              {tKey(translationPrefix, "fixed")}
            </Button>
            <Button
              size="small"
              variant={descontoTipo === "percent" ? "contained" : "outlined"}
              color={descontoTipo === "percent" ? "primary" : "default"}
              className={classes.tipoBtn}
              onClick={() => setDescontoTipo("percent")}
            >
              {tKey(translationPrefix, "percent")}
            </Button>
          </Box>
        </Box>
        <TextField
          label={descontoTipo === "percent" ? tKey(translationPrefix, "percentLabel") : tKey(translationPrefix, "fixedLabel")}
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 0, step: descontoTipo === "percent" ? 0.1 : 0.01 }}
          value={descontoValorInput}
          onChange={(e) => setDescontoValorInput(e.target.value)}
          style={{ width: 140 }}
        />
      </Box>
      <Box mt={1.5}>
        <Typography variant="body2" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{tKey(translationPrefix, "subtotal")}</span>
          <span>{formatBrl(subtotal)}</span>
        </Typography>
        {desconto > 0 && (
          <Typography variant="body2" color="secondary" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{tKey(translationPrefix, "amount")}</span>
            <span>- {formatBrl(desconto)}</span>
          </Typography>
        )}
        <Typography variant="h6" style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span>{tKey(translationPrefix, "totalDue")}</span>
          <span>{formatBrl(total)}</span>
        </Typography>
      </Box>
    </Box>
  );
}

export function useDescontoTotals(subtotal, descontoTipo, descontoValorInput) {
  const descontoPayload = buildDescontoPayload(descontoTipo, descontoValorInput);
  return applyDiscount(subtotal, descontoPayload);
}
