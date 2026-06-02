import React, { useState, useEffect, useMemo } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Chip,
  InputAdornment,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import {
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
} from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import useModules from "../../hooks/useModules";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";

import moment from "moment";
import { i18n } from "../../translate/i18n";

const isCompanyActive = (company) => company?.status !== false;

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
    overflowX: "auto",
    ...theme.scrollbarStyles,
  },
  textfield: {
    width: "100%",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  searchField: {
    flex: 1,
    minWidth: 220,
  },
  statusActive: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  statusInactive: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.getContrastText(theme.palette.grey[400]),
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading, availableModules = [] } = props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    modules: [],
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      const next = { ...initialValue };
      if (moment(initialValue?.dueDate).isValid()) {
        next.dueDate = moment(initialValue.dueDate).format("YYYY-MM-DD");
      }
      return {
        ...prev,
        ...next,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit({ ...data, modules: record.modules });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Formik
        enableReinitialize
        className={classes.fullWidth}
        initialValues={record}
        onSubmit={(values) => handleSubmit(values)}
      >
        {() => (
          <Form className={classes.fullWidth}>
            <Grid spacing={2} justifyContent="flex-end" container>
              <Grid xs={12} sm={6} md={4} item>
                <Field
                  as={TextField}
                  label={i18n.t("settings.company.form.name")}
                  name="name"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("settings.company.form.email")}
                  name="email"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  required
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("settings.company.form.phone")}
                  name="phone"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="plan-selection">
                    {i18n.t("settings.company.form.plan")}
                  </InputLabel>
                  <Field
                    as={Select}
                    id="plan-selection"
                    label={i18n.t("settings.company.form.plan")}
                    labelId="plan-selection-label"
                    name="planId"
                    margin="dense"
                    required
                  >
                    {plans.map((plan, key) => (
                      <MenuItem key={key} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">
                    {i18n.t("settings.company.form.status")}
                  </InputLabel>
                  <Field
                    as={Select}
                    id="status-selection"
                    label={i18n.t("settings.company.form.status")}
                    labelId="status-selection-label"
                    name="status"
                    margin="dense"
                  >
                    <MenuItem value={true}>
                      {i18n.t("settings.company.status.active")}
                    </MenuItem>
                    <MenuItem value={false}>
                      {i18n.t("settings.company.status.inactive")}
                    </MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">
                    {i18n.t("settings.company.form.campanhas")}
                  </InputLabel>
                  <Field
                    as={Select}
                    id="campaigns-selection"
                    label={i18n.t("settings.company.form.campanhas")}
                    labelId="campaigns-selection-label"
                    name="campaignsEnabled"
                    margin="dense"
                  >
                    <MenuItem value={true}>
                      {i18n.t("settings.company.form.enabled")}
                    </MenuItem>
                    <MenuItem value={false}>
                      {i18n.t("settings.company.form.disabled")}
                    </MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <Field
                    as={TextField}
                    label={i18n.t("settings.company.form.dueDate")}
                    type="date"
                    name="dueDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="recorrencia-selection">
                    {i18n.t("settings.company.form.recurrence")}
                  </InputLabel>
                  <Field
                    as={Select}
                    label={i18n.t("settings.company.form.recurrence")}
                    labelId="recorrencia-selection-label"
                    id="recurrence"
                    name="recurrence"
                    margin="dense"
                  >
                    <MenuItem value="MENSAL">
                      {i18n.t("settings.company.form.monthly")}
                    </MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              {record.id && (
                <Grid xs={12} item>
                  <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
                    {i18n.t("settings.company.form.modules")}
                  </Typography>
                  <FormGroup row>
                    {availableModules.map((mod) => (
                      <FormControlLabel
                        key={mod.id}
                        control={
                          <Checkbox
                            checked={
                              Array.isArray(record.modules) &&
                              record.modules.includes(mod.id)
                            }
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRecord((prev) => ({
                                ...prev,
                                modules: checked
                                  ? [...(prev.modules || []), mod.id]
                                  : (prev.modules || []).filter(
                                      (m) => m !== mod.id
                                    ),
                              }));
                            }}
                          />
                        }
                        label={`${mod.name} – ${mod.description}`}
                      />
                    ))}
                  </FormGroup>
                </Grid>
              )}
              <Grid xs={12} item>
                <Grid justifyContent="flex-end" spacing={1} container>
                  <Grid xs={4} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      onClick={() => onCancel()}
                      variant="contained"
                    >
                      {i18n.t("settings.company.buttons.clear")}
                    </ButtonWithSpinner>
                  </Grid>
                  {record.id !== undefined ? (
                    <>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          color="secondary"
                        >
                          {i18n.t("settings.company.buttons.delete")}
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={2} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("settings.company.buttons.expire")}
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => handleOpenModalUsers()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("settings.company.buttons.user")}
                        </ButtonWithSpinner>
                      </Grid>
                    </>
                  ) : null}
                  <Grid xs={6} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {i18n.t("settings.company.buttons.save")}
                    </ButtonWithSpinner>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const {
    records,
    onSelect,
    showActivate = false,
    onActivate,
    activatingId = null,
  } = props;
  const classes = useStyles();
  const { dateToClient } = useDate();

  const renderStatusChip = (row) => {
    const active = isCompanyActive(row);
    return (
      <Chip
        size="small"
        label={
          active
            ? i18n.t("settings.company.status.active")
            : i18n.t("settings.company.status.inactive")
        }
        className={active ? classes.statusActive : classes.statusInactive}
      />
    );
  };

  const renderPlan = (row) => {
    return row.planId !== null ? row.plan?.name : "-";
  };

  const renderCampaignsStatus = (row) => {
    if (
      has(row, "settings") &&
      isArray(row.settings) &&
      row.settings.length > 0
    ) {
      const setting = row.settings.find((s) => s.key === "campaignsEnabled");
      if (setting) {
        return setting.value === "true"
          ? i18n.t("settings.company.form.enabled")
          : i18n.t("settings.company.form.disabled");
      }
    }
    return i18n.t("settings.company.form.disabled");
  };

  const rowStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff === 5) {
        return { backgroundColor: "#fffead" };
      }
      if (diff >= -3 && diff <= 4) {
        return { backgroundColor: "#f7cc8f" };
      }
      if (diff === -4) {
        return { backgroundColor: "#fa8c8c" };
      }
    }
    return {};
  };

  return (
    <Paper className={classes.tableContainer}>
      <Table
        className={classes.fullWidth}
        size="small"
        aria-label="companies-table"
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" style={{ width: "1%" }}>
              #
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.name")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.email")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.phone")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.plan")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.campanhas")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.status")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.createdAt")}
            </TableCell>
            <TableCell align="left">
              {i18n.t("settings.company.form.expire")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("settings.company.empty")}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            records.map((row) => (
              <TableRow style={rowStyle(row)} key={row.id}>
                <TableCell align="center" style={{ width: "1%" }}>
                  {showActivate ? (
                    <IconButton
                      onClick={() => onActivate(row)}
                      aria-label="activate"
                      disabled={activatingId === row.id}
                      color="primary"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => onSelect(row)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell align="left">{row.name || "-"}</TableCell>
                <TableCell align="left">{row.email || "-"}</TableCell>
                <TableCell align="left">{row.phone || "-"}</TableCell>
                <TableCell align="left">{renderPlan(row)}</TableCell>
                <TableCell align="left">{renderCampaignsStatus(row)}</TableCell>
                <TableCell align="left">{renderStatusChip(row)}</TableCell>
                <TableCell align="left">
                  {dateToClient(row.createdAt)}
                </TableCell>
                <TableCell align="left">
                  {dateToClient(row.dueDate)}
                  <br />
                  <span>{row.recurrence}</span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}

const emptyRecord = {
  name: "",
  email: "",
  phone: "",
  planId: "",
  status: true,
  campaignsEnabled: false,
  dueDate: "",
  recurrence: "",
  modules: [],
};

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove, getModules, updateModules } =
    useCompanies();
  const { listAvailable } = useModules();
  const [availableModules, setAvailableModules] = useState([]);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({ ...emptyRecord });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false);
  const [activeSearch, setActiveSearch] = useState("");
  const [inactiveSearch, setInactiveSearch] = useState("");
  const [activatingId, setActivatingId] = useState(null);

  useEffect(() => {
    loadPlans();
    loadAvailableModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAvailableModules = async () => {
    try {
      const modules = await listAvailable();
      setAvailableModules(modules || []);
    } catch (e) {
      setAvailableModules([]);
    }
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.errorList"));
    }
    setLoading(false);
  };

  const matchesSearch = (company, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (company.name || "").toLowerCase().includes(q) ||
      (company.email || "").toLowerCase().includes(q) ||
      (company.phone || "").toLowerCase().includes(q)
    );
  };

  const activeRecords = useMemo(
    () =>
      records
        .filter(isCompanyActive)
        .filter((c) => matchesSearch(c, activeSearch)),
    [records, activeSearch]
  );

  const inactiveRecords = useMemo(
    () =>
      records
        .filter((c) => !isCompanyActive(c))
        .filter((c) => matchesSearch(c, inactiveSearch)),
    [records, inactiveSearch]
  );

  const inactiveCount = useMemo(
    () => records.filter((c) => !isCompanyActive(c)).length,
    [records]
  );

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const { modules, ...companyData } = data;
      if (data.id !== 0 && data.id !== undefined) {
        await update(companyData);
        if (Array.isArray(modules)) {
          await updateModules(data.id, modules);
        }
      } else {
        await save(companyData);
      }

      await loadPlans();
      handleCloseEditModal();
      toast.success(i18n.t("settings.company.toasts.success"));
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.error"));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCloseEditModal();
      toast.success(i18n.t("settings.company.toasts.success"));
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.errorOperation"));
    }
    setLoading(false);
    setShowConfirmDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setRecord({ ...emptyRecord });
  };

  const handleOpenNew = () => {
    setRecord({ ...emptyRecord });
    setEditModalOpen(true);
  };

  const handleSelect = async (data) => {
    let campaignsEnabled = false;

    const setting = (data.settings || []).find(
      (s) => s.key && s.key.indexOf("campaignsEnabled") > -1
    );
    if (setting) {
      campaignsEnabled =
        setting.value === "true" || setting.value === "enabled";
    }

    let modules = [];
    try {
      modules = (await getModules(data.id)) || [];
    } catch (e) {
      // ignore
    }

    setRecord({
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      campaignsEnabled,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
      modules,
    });
    setEditModalOpen(true);
  };

  const handleActivate = async (company) => {
    setActivatingId(company.id);
    try {
      await update({
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        planId: company.planId,
        status: true,
        dueDate: company.dueDate,
        recurrence: company.recurrence,
      });
      await loadPlans();
      toast.success(i18n.t("settings.company.toasts.reactivated"));
    } catch (e) {
      toast.error(i18n.t("settings.company.toasts.errorOperation"));
    } finally {
      setActivatingId(null);
    }
  };

  const editModalTitle = record.id
    ? i18n.t("settings.company.modal.editTitle")
    : i18n.t("settings.company.modal.newTitle");

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Box className={classes.toolbar}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          size="small"
          placeholder={i18n.t("settings.company.searchPlaceholder")}
          value={activeSearch}
          onChange={(e) => setActiveSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNew}
        >
          {i18n.t("settings.company.buttons.new")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<VisibilityOffIcon />}
          onClick={() => {
            setInactiveSearch("");
            setInactiveModalOpen(true);
          }}
          disabled={inactiveCount === 0}
        >
          {i18n.t("settings.company.buttons.viewInactive")} ({inactiveCount})
        </Button>
      </Box>

      <CompaniesManagerGrid records={activeRecords} onSelect={handleSelect} />

      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>{editModalTitle}</DialogTitle>
        <DialogContent dividers>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCloseEditModal}
            loading={loading}
            availableModules={availableModules}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={inactiveModalOpen}
        onClose={() => setInactiveModalOpen(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>{i18n.t("settings.company.modal.inactiveTitle")}</DialogTitle>
        <DialogContent dividers>
          <TextField
            className={classes.fullWidth}
            variant="outlined"
            size="small"
            placeholder={i18n.t("settings.company.searchInactivePlaceholder")}
            value={inactiveSearch}
            onChange={(e) => setInactiveSearch(e.target.value)}
            style={{ marginBottom: 16 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
            {i18n.t("settings.company.inactiveHint")}
          </Typography>
          <CompaniesManagerGrid
            records={inactiveRecords}
            showActivate
            onActivate={handleActivate}
            activatingId={activatingId}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        title={i18n.t("settings.company.confirmModal.title")}
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        {i18n.t("settings.company.confirmModal.confirm")}
      </ConfirmationModal>
    </Paper>
  );
}
