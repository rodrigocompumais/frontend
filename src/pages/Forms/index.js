import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ContentCopyIcon from "@material-ui/icons/ContentCopy";
import VisibilityIcon from "@material-ui/icons/Visibility";
import BarChartIcon from "@material-ui/icons/BarChart";
import SearchIcon from "@material-ui/icons/Search";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchWrapper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  statusChip: {
    fontWeight: 600,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
  linkButton: {
    textTransform: "none",
    fontSize: "0.75rem",
  },
  responseCount: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
}));

const Forms = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  useEffect(() => {
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    fetchForms();
  }, [pageNumber, searchParam]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/forms", {
        params: { searchParam, pageNumber },
      });
      setForms(data.forms || []);
      setHasMore(data.hasMore || false);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleNewForm = () => {
    history.push("/forms/new");
  };

  const handleEditForm = (formId) => {
    history.push(`/forms/${formId}`);
  };

  const handleViewResponses = (formId) => {
    history.push(`/forms/${formId}/responses`);
  };

  const handleViewAnalytics = (formId) => {
    history.push(`/forms/${formId}/analytics`);
  };

  const handleDeleteForm = (form) => {
    setSelectedForm(form);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedForm) return;

    try {
      await api.delete(`/forms/${selectedForm.id}`);
      toast.success(i18n.t("forms.toasts.deleteSuccess"));
      fetchForms();
      setConfirmModalOpen(false);
      setSelectedForm(null);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateForm = async (formId) => {
    try {
      await api.post(`/forms/${formId}/duplicate`);
      toast.success(i18n.t("forms.toasts.duplicateSuccess"));
      fetchForms();
    } catch (err) {
      toastError(err);
    }
  };

  const handleCopyLink = (form) => {
    const link = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(link);
    toast.success(i18n.t("forms.toasts.linkCopied"));
  };

  const handleViewPublic = (form) => {
    window.open(`/f/${form.slug}`, "_blank");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("forms.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Can
            role={user.profile}
            perform="forms:create"
            yes={() => (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNewForm}
                startIcon={<AddIcon />}
                style={{
                  borderRadius: 8,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {i18n.t("forms.buttons.new")}
              </Button>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.searchWrapper}>
          <TextField
            placeholder={i18n.t("forms.search.placeholder")}
            variant="outlined"
            size="small"
            fullWidth
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                {i18n.t("forms.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("forms.table.status")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("forms.table.responses")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("forms.table.lastResponse")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("forms.table.createdAt")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("forms.table.actions")}
              </TableCell>
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
            {!loading && forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {i18n.t("forms.noForms")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              forms.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {form.name}
                      </Typography>
                      {form.description && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          style={{ display: "block" }}
                        >
                          {form.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={
                        form.isActive ? (
                          <CheckCircleIcon style={{ fontSize: 16 }} />
                        ) : (
                          <CancelIcon style={{ fontSize: 16 }} />
                        )
                      }
                      label={form.isActive ? "Ativo" : "Inativo"}
                      size="small"
                      color={form.isActive ? "primary" : "default"}
                      className={classes.statusChip}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      className={classes.responseCount}
                    >
                      {form.responseCount || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="textSecondary">
                      {form.updatedAt
                        ? format(new Date(form.updatedAt), "dd/MM/yyyy")
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(form.createdAt), "dd/MM/yyyy")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box className={classes.actionButtons}>
                      <Tooltip title={i18n.t("forms.actions.viewPublic")}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewPublic(form)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("forms.actions.copyLink")}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyLink(form)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("forms.actions.viewResponses")}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewResponses(form.id)}
                        >
                          <BarChartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("forms.actions.edit")}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditForm(form.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("forms.actions.duplicate")}>
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicateForm(form.id)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("forms.actions.delete")}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteForm(form)}
                          color="secondary"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      <ConfirmationModal
        title={i18n.t("forms.confirmationModal.deleteTitle")}
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedForm(null);
        }}
        onConfirm={confirmDelete}
      >
        {i18n.t("forms.confirmationModal.deleteMessage")}
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Forms;
