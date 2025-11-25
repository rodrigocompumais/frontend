import React from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FilterListIcon from "@material-ui/icons/FilterList";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  filterBar: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
  },
  filterTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  formControl: {
    minWidth: 200,
    [theme.breakpoints.down("sm")]: {
      minWidth: "100%",
    },
  },
  dateField: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  applyButton: {
    height: "56px",
    borderRadius: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 600,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

const FilterBar = ({
  filterType,
  onFilterTypeChange,
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

  return (
    <Paper className={classes.filterBar} elevation={0}>
      <Box className={classes.filterTitle}>
        <FilterListIcon fontSize="small" />
        <span>{i18n.t("dashboard.filters.title") || "Filtros"}</span>
      </Box>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel id="filter-type-label">
              {i18n.t("dashboard.filters.filterType.title")}
            </InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
            >
              <MenuItem value={1}>
                {i18n.t("dashboard.filters.filterType.options.perDate")}
              </MenuItem>
              <MenuItem value={2}>
                {i18n.t("dashboard.filters.filterType.options.perPeriod")}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {filterType === 1 ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label={i18n.t("dashboard.filters.initialDate")}
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                fullWidth
                className={classes.dateField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label={i18n.t("dashboard.filters.finalDate")}
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                fullWidth
                className={classes.dateField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel id="period-label">
                {i18n.t("dashboard.periodSelect.title")}
              </InputLabel>
              <Select
                labelId="period-label"
                value={period}
                onChange={(e) => onPeriodChange(e.target.value)}
              >
                <MenuItem value={0}>
                  {i18n.t("dashboard.periodSelect.options.none")}
                </MenuItem>
                <MenuItem value={3}>
                  {i18n.t("dashboard.periodSelect.options.last3")}
                </MenuItem>
                <MenuItem value={7}>
                  {i18n.t("dashboard.periodSelect.options.last7")}
                </MenuItem>
                <MenuItem value={15}>
                  {i18n.t("dashboard.periodSelect.options.last15")}
                </MenuItem>
                <MenuItem value={30}>
                  {i18n.t("dashboard.periodSelect.options.last30")}
                </MenuItem>
                <MenuItem value={60}>
                  {i18n.t("dashboard.periodSelect.options.last60")}
                </MenuItem>
                <MenuItem value={90}>
                  {i18n.t("dashboard.periodSelect.options.last90")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={onApply}
            disabled={loading}
            fullWidth
            className={classes.applyButton}
          >
            {loading
              ? i18n.t("dashboard.buttons.applying") || "Aplicando..."
              : i18n.t("dashboard.buttons.filter")}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterBar;

