import React, { useState } from "react";
import {
  Button,
  Popover,
  Box,
  TextField,
  Chip,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FilterListIcon from "@material-ui/icons/FilterList";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import { i18n } from "../../translate/i18n";

const periodOptions = [
  { value: 1, label: "Hoje" },
  { value: 3, label: "3 dias" },
  { value: 7, label: "7 dias" },
  { value: 15, label: "15 dias" },
  { value: 30, label: "30 dias" },
  { value: 0, label: "Personalizado" },
];

const useStyles = makeStyles((theme) => ({
  filterButton: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 500,
    padding: "8px 16px",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  filterButtonActive: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  popover: {
    padding: theme.spacing(2),
    minWidth: 300,
    maxWidth: 350,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  sectionTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1),
  },
  chip: {
    borderRadius: 6,
    fontWeight: 500,
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
    },
  },
  chipSelected: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  dateContainer: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  dateField: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px 12px",
      fontSize: "0.85rem",
    },
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  applyButton: {
    flex: 1,
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
  },
  clearButton: {
    borderRadius: 8,
    textTransform: "none",
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  },
}));

const FilterDropdown = ({
  period,
  onPeriodChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onApply,
  loading,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [localPeriod, setLocalPeriod] = useState(period || 7);
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom || "");
  const [localDateTo, setLocalDateTo] = useState(dateTo || "");

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodSelect = (value) => {
    setLocalPeriod(value);
    if (value !== 0) {
      setLocalDateFrom("");
      setLocalDateTo("");
    }
  };

  const handleApply = () => {
    if (localPeriod > 0) {
      onPeriodChange(localPeriod);
      onDateFromChange("");
      onDateToChange("");
    } else {
      onPeriodChange(0);
      onDateFromChange(localDateFrom);
      onDateToChange(localDateTo);
    }
    onApply();
    handleClose();
  };

  const handleClear = () => {
    setLocalPeriod(7);
    setLocalDateFrom("");
    setLocalDateTo("");
    onPeriodChange(7);
    onDateFromChange("");
    onDateToChange("");
  };

  const isActive = period > 0 || (dateFrom && dateTo);
  const getActiveLabel = () => {
    if (period > 0) {
      const option = periodOptions.find(p => p.value === period);
      return option ? option.label : "";
    }
    if (dateFrom && dateTo) {
      return "Personalizado";
    }
    return "";
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        className={`${classes.filterButton} ${isActive ? classes.filterButtonActive : ""}`}
        startIcon={<FilterListIcon />}
      >
        Filtros
        {isActive && (
          <Chip
            size="small"
            label={getActiveLabel()}
            style={{ 
              marginLeft: 8, 
              height: 20, 
              fontSize: "0.7rem",
              backgroundColor: isActive ? "rgba(255,255,255,0.2)" : undefined
            }}
          />
        )}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          className: classes.popover,
          elevation: 8,
        }}
      >
        <Box className={classes.header}>
          <Typography className={classes.title}>
            Filtrar Período
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography className={classes.sectionTitle}>
          Período Rápido
        </Typography>
        <Box className={classes.chipContainer}>
          {periodOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              size="small"
              onClick={() => handlePeriodSelect(option.value)}
              className={`${classes.chip} ${localPeriod === option.value ? classes.chipSelected : ""}`}
              variant={localPeriod === option.value ? "default" : "outlined"}
            />
          ))}
        </Box>

        {localPeriod === 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              Período Personalizado
            </Typography>
            <Box className={classes.dateContainer}>
              <TextField
                label="De"
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
                variant="outlined"
                size="small"
                className={classes.dateField}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Até"
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
                variant="outlined"
                size="small"
                className={classes.dateField}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </>
        )}

        <Box className={classes.actions}>
          <Button
            variant="text"
            onClick={handleClear}
            className={classes.clearButton}
            size="small"
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            className={classes.applyButton}
            disabled={loading || (localPeriod === 0 && (!localDateFrom || !localDateTo))}
            startIcon={<CheckIcon />}
          >
            {loading ? "Aplicando..." : "Aplicar"}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default FilterDropdown;

