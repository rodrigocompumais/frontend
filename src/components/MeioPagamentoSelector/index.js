import React from "react";
import { Box, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountBalanceWalletOutlinedIcon from "@material-ui/icons/AccountBalanceWalletOutlined";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { i18n } from "../../translate/i18n";

export const PAYMENT_METHOD_IDS = ["pix", "dinheiro", "cartao", "outro"];

const METHOD_ICONS = {
  pix: AccountBalanceWalletOutlinedIcon,
  dinheiro: AttachMoneyIcon,
  cartao: CreditCardIcon,
  outro: MoreHorizIcon,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  label: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.8125rem",
    letterSpacing: "0.02em",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  option: {
    minHeight: 56,
    padding: theme.spacing(1, 0.5),
    textTransform: "none",
    flexDirection: "column",
    borderRadius: theme.spacing(1),
    borderWidth: 1.5,
    lineHeight: 1.2,
    "& .MuiButton-label": {
      flexDirection: "column",
      gap: 2,
    },
  },
  optionIcon: {
    fontSize: 22,
  },
  optionLabel: {
    fontSize: "0.75rem",
    fontWeight: 600,
  },
}));

export default function MeioPagamentoSelector({
  value,
  onChange,
  disabled = false,
  label,
  methods = PAYMENT_METHOD_IDS,
  translationKey = "mesas.paymentMethods",
}) {
  const classes = useStyles();
  const labelText = label || i18n.t("mesas.paymentMethod");

  return (
    <Box className={classes.root}>
      <Typography component="p" variant="body2" className={classes.label}>
        {labelText}
      </Typography>
      <Box className={classes.grid} role="group" aria-label={labelText}>
        {methods.map((method) => {
          const Icon = METHOD_ICONS[method] || MoreHorizIcon;
          const selected = value === method;
          return (
            <Button
              key={method}
              type="button"
              variant={selected ? "contained" : "outlined"}
              color={selected ? "primary" : "default"}
              className={classes.option}
              disabled={disabled}
              onClick={() => onChange(method)}
              aria-pressed={selected}
            >
              <Icon className={classes.optionIcon} />
              <span className={classes.optionLabel}>
                {i18n.t(`${translationKey}.${method}`) || method}
              </span>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
