import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

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
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
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
  subscriptionCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  subscriptionInfo: {
    marginTop: theme.spacing(1),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  
  // Estados para gerenciamento de assinatura
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [autoRenew, setAutoRenew] = useState(false);


  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };


  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };
  // Carregar status da assinatura
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?.companyId) return;
      
      try {
        setSubscriptionLoading(true);
        const { data } = await api.get(`/companies/${user.companyId}/preapproval-status`);
        setSubscriptionStatus(data);
        setAutoRenew(data.autoRenew || false);
      } catch (err) {
        // Se não tiver Preapproval, não é erro
        if (err.response?.status !== 404) {
          toastError(err);
        }
      } finally {
        setSubscriptionLoading(false);
      }
    };
    
    fetchSubscriptionStatus();
  }, [user?.companyId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);


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
  const rowStyle = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    if (dias < 0 && record.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    const status = record.status;
    if (status === "paid") {
      return i18n.t("invoices.paid");
    }
    if (dias < 0) {
      return i18n.t("invoices.expired");
    } else {
      return i18n.t("invoices.open");
    }

  }

  const handleToggleAutoRenew = async () => {
    if (!user?.companyId) return;
    
    try {
      setSubscriptionLoading(true);
      const newAutoRenew = !autoRenew;
      await api.put(`/companies/${user.companyId}/auto-renew`, {
        autoRenew: newAutoRenew,
      });
      setAutoRenew(newAutoRenew);
      toast.success(
        newAutoRenew
          ? "Renovação automática ativada com sucesso!"
          : "Renovação automática desativada com sucesso!"
      );
    } catch (err) {
      toastError(err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleCancelPreapproval = async () => {
    if (!user?.companyId) return;
    
    if (!window.confirm("Tem certeza que deseja cancelar a assinatura recorrente? Você precisará renovar manualmente.")) {
      return;
    }
    
    try {
      setSubscriptionLoading(true);
      await api.delete(`/companies/${user.companyId}/preapproval`);
      setSubscriptionStatus(null);
      setAutoRenew(false);
      toast.success("Assinatura recorrente cancelada com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}

      ></SubscriptionModal>
      <MainHeader>
        <Title>{i18n.t("invoices.title")}</Title>
      </MainHeader>
      
      {/* Card de Gerenciamento de Assinatura */}
      {user?.companyId && (
        <Card className={classes.subscriptionCard} variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gerenciamento de Assinatura
            </Typography>
            
            {subscriptionLoading && !subscriptionStatus ? (
              <Box className={classes.loadingContainer}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Grid container spacing={2} className={classes.subscriptionInfo}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status da Assinatura:
                  </Typography>
                  {subscriptionStatus?.hasPreapproval ? (
                    <Box display="flex" alignItems="center" mt={1}>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={
                          subscriptionStatus.status === "authorized"
                            ? "Ativa"
                            : subscriptionStatus.status || "Desconhecido"
                        }
                        color="primary"
                        size="small"
                        className={classes.statusChip}
                      />
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        ID: {subscriptionStatus.preapprovalId?.substring(0, 20)}...
                      </Typography>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" mt={1}>
                      <Chip
                        icon={<CancelIcon />}
                        label="Não configurada"
                        color="default"
                        size="small"
                        className={classes.statusChip}
                      />
                      <Typography variant="body2" style={{ marginLeft: 8, color: "#666" }}>
                        Renovação manual via link de pagamento
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRenew}
                        onChange={handleToggleAutoRenew}
                        disabled={subscriptionLoading || !subscriptionStatus?.hasPreapproval}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Renovação Automática
                        {!subscriptionStatus?.hasPreapproval && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            (Configure uma assinatura recorrente primeiro)
                          </Typography>
                        )}
                      </Typography>
                    }
                  />
                </Grid>
                
                {subscriptionStatus?.hasPreapproval && (
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={handleCancelPreapproval}
                      disabled={subscriptionLoading}
                    >
                      Cancelar Assinatura Recorrente
                    </Button>
                  </Grid>
                )}
                
                {user?.company?.dueDate && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Próximo vencimento: {moment(user.company.dueDate).format("DD/MM/YYYY")}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
      
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Id</TableCell>
              <TableCell align="center">{i18n.t("invoices.details")}</TableCell>
              <TableCell align="center">{i18n.t("invoices.value")}</TableCell>
              <TableCell align="center">{i18n.t("invoices.dueDate")}</TableCell>
              <TableCell align="center">{i18n.t("invoices.status")}</TableCell>
              <TableCell align="center">{i18n.t("invoices.action")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {invoices.map((invoices) => (
                <TableRow style={rowStyle(invoices)} key={invoices.id}>
                  <TableCell align="center">{invoices.id}</TableCell>
                  <TableCell align="center">{invoices.detail}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">{invoices.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell align="center">{moment(invoices.dueDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">{rowStatus(invoices)}</TableCell>
                  <TableCell align="center">
                    {rowStatus(invoices) !== i18n.t("invoices.paid") ?
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenContactModal(invoices)}
                      >
                        {i18n.t("invoices.PAY")}
                      </Button> :
                      <Button
                        size="small"
                        variant="outlined" 
                        /* color="secondary"
                        disabled */
                      >
                        {i18n.t("invoices.PAID")}
                      </Button>}

                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
