/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import TimerOffIcon from "@material-ui/icons/TimerOff";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import ReplayIcon from "@material-ui/icons/Replay";
import RepeatIcon from "@material-ui/icons/Repeat";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@material-ui/core";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Campaigns = () => {
  const classes = useStyles();

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);

  const { datetimeToClient } = useDate();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return i18n.t("campaigns.status.inactive");
      case "PROGRAMADA":
        return i18n.t("campaigns.status.programmed");
      case "EM_ANDAMENTO":
        return i18n.t("campaigns.status.inProgress");
      case "CANCELADA":
        return i18n.t("campaigns.status.canceled");
      case "FINALIZADA":
        return i18n.t("campaigns.status.finished");
      default:
        return val;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [rerunCampaign, setRerunCampaign] = useState(null);
  const [rerunScheduledAt, setRerunScheduledAt] = useState("");

  const handleOpenRerun = (campaign) => {
    const defaultDate = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const formatted = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth() + 1)}-${pad(defaultDate.getDate())}T${pad(defaultDate.getHours())}:${pad(defaultDate.getMinutes())}`;
    setRerunScheduledAt(formatted);
    setRerunCampaign(campaign);
    setRerunDialogOpen(true);
  };

  const handleConfirmRerun = async () => {
    try {
      await api.post(`/campaigns/${rerunCampaign.id}/rerun`, {
        scheduledAt: rerunScheduledAt
          ? new Date(rerunScheduledAt).toISOString()
          : null,
      });
      toast.success(i18n.t("campaigns.toasts.rerun"));
      setRerunDialogOpen(false);
      setRerunCampaign(null);
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      {/* Diálogo de reagendamento "Rodar Novamente" */}
      <Dialog
        open={rerunDialogOpen}
        onClose={() => setRerunDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{i18n.t("campaigns.dialog.rerunDialog.title")}</DialogTitle>
        <DialogContent>
          <p style={{ marginTop: 0, marginBottom: 12 }}>
            {i18n.t("campaigns.dialog.rerunDialog.description")}
          </p>
          <TextField
            label={i18n.t("campaigns.dialog.rerunDialog.scheduleLabel")}
            type="datetime-local"
            value={rerunScheduledAt}
            onChange={(e) => setRerunScheduledAt(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRerunDialogOpen(false)} color="secondary">
            {i18n.t("campaigns.dialog.rerunDialog.cancel")}
          </Button>
          <Button
            onClick={handleConfirmRerun}
            color="primary"
            variant="contained"
          >
            {i18n.t("campaigns.dialog.rerunDialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingCampaign.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModal
        resetPagination={() => {
          setPageNumber(1);
          fetchCampaigns();
        }}
        open={campaignModalOpen}
        onClose={handleCloseCampaignModal}
        aria-labelledby="form-dialog-title"
        campaignId={selectedCampaign && selectedCampaign.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>{i18n.t("campaigns.title")}</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={6} sm={6} item>
                <TextField
                  fullWidth
                  placeholder={i18n.t("campaigns.searchPlaceholder")}
                  type="search"
                  value={searchParam}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={6} sm={6} item>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenCampaignModal}
                  color="primary"
                >
                  {i18n.t("campaigns.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("campaigns.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.status")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.contactList")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.whatsapp")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.scheduledAt")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.estimatedCompletedAt")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.completedAt")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("campaigns.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell align="center">{campaign.name}</TableCell>
                <TableCell align="center">
                  {formatStatus(campaign.status)}
                  {campaign.isRecurring && (
                    <Tooltip title="Recorrente (mensal)">
                      <RepeatIcon
                        fontSize="small"
                        color="primary"
                        style={{ verticalAlign: "middle", marginLeft: 4 }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
                  <TableCell align="center">
                    {campaign.contactListId
                      ? campaign.contactList.name
                      : i18n.t("campaigns.table.notDefined")}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.whatsappId
                      ? campaign.whatsapp.name
                      : i18n.t("campaigns.table.notDefined2")}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.scheduledAt
                      ? datetimeToClient(campaign.scheduledAt)
                      : i18n.t("campaigns.table.notScheduled")}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.estimatedCompletedAt
                      ? datetimeToClient(campaign.estimatedCompletedAt)
                      : i18n.t("campaigns.table.notDefined")}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.completedAt
                      ? datetimeToClient(campaign.completedAt)
                      : i18n.t("campaigns.table.notConcluded")}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.status === "EM_ANDAMENTO" && (
                      <Tooltip title={i18n.t("campaigns.table.stopCampaign")}>
                        <IconButton
                          onClick={() => cancelCampaign(campaign)}
                          size="small"
                        >
                          <PauseCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {campaign.status === "CANCELADA" && (
                      <Tooltip title={i18n.t("campaigns.table.stopCampaign")}>
                        <IconButton
                          onClick={() => restartCampaign(campaign)}
                          size="small"
                        >
                          <PlayCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(campaign.status === "FINALIZADA" ||
                      campaign.status === "CANCELADA") && (
                      <Tooltip title={i18n.t("campaigns.table.rerunCampaign")}>
                        <IconButton
                          onClick={() => handleOpenRerun(campaign)}
                          size="small"
                        >
                          <ReplayIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton
                      onClick={() =>
                        history.push(`/campaign/${campaign.id}/report`)
                      }
                      size="small"
                    >
                      <DescriptionIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingCampaign(campaign);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={8} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Campaigns;
