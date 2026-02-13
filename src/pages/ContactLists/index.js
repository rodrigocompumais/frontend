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
import PeopleIcon from "@material-ui/icons/People";
import DownloadIcon from "@material-ui/icons/GetApp";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Box from "@material-ui/core/Box";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    // Para paginação tradicional, substituir as listas ao invés de adicionar
    return action.payload;
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  pageButton: {
    minWidth: 40,
    padding: theme.spacing(0.5, 1),
  },
  activePageButton: {
    backgroundColor: "#f57c00", // Laranja para destacar a página atual
    color: "#ffffff",
    fontWeight: "bold",
    boxShadow: theme.shadows[4],
    border: "2px solid #e65100",
    minWidth: 44,
    "&:hover": {
      backgroundColor: "#e65100",
      boxShadow: theme.shadows[6],
    },
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 500,
    marginLeft: theme.spacing(2),
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);

  const limit = 20; // Mesmo limite usado no backend
  const totalPages = Math.ceil(totalCount / limit);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setTotalCount(data.count || 0);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
          setHasMore(false);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== pageNumber) {
      setPageNumber(newPage);
      // Scroll para o topo da tabela
      const paperElement = document.querySelector(`.${classes.mainPaper}`);
      if (paperElement) {
        paperElement.scrollTop = 0;
      }
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      handlePageChange(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      handlePageChange(pageNumber + 1);
    }
  };

  // Gerar array de números de página para exibir
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas com lógica de elipse
      if (pageNumber <= 3) {
        // Início: mostrar primeiras páginas
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (pageNumber >= totalPages - 2) {
        // Fim: mostrar últimas páginas
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: mostrar páginas ao redor da atual
        pages.push(1);
        pages.push("...");
        for (let i = pageNumber - 1; i <= pageNumber + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${
            deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>{i18n.t("contactLists.title")}</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={7} sm={6} item>
                <TextField
                  fullWidth
                  placeholder={i18n.t("contacts.searchPlaceholder")}
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
              <Grid xs={5} sm={6} item>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleOpenContactListModal}
                >
                  {i18n.t("contactLists.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      {totalPages > 1 && (
        <Box className={classes.paginationContainer}>
          <Box className={classes.paginationControls}>
            <IconButton
              onClick={handlePreviousPage}
              disabled={pageNumber === 1 || loading}
              size="small"
              title="Página anterior"
            >
              <ChevronLeftIcon />
            </IconButton>
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${index}`} style={{ padding: "0 8px" }}>
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={page}
                  className={`${classes.pageButton} ${
                    page === pageNumber ? classes.activePageButton : ""
                  }`}
                  variant={page === pageNumber ? "contained" : "outlined"}
                  color={page === pageNumber ? "secondary" : "primary"}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  size="small"
                >
                  {page}
                </Button>
              );
            })}
            <IconButton
              onClick={handleNextPage}
              disabled={pageNumber === totalPages || loading}
              size="small"
              title="Próxima página"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box className={classes.pageInfo}>
            {totalCount > 0 && (
              <span>
                Página <strong>{pageNumber}</strong> de <strong>{totalPages}</strong> • {totalCount} {totalCount === 1 ? "lista" : "listas"}
              </span>
            )}
          </Box>
        </Box>
      )}
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("contactLists.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contactLists.table.contacts")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contactLists.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {loading && contactLists.length === 0 ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRowSkeleton key={`skeleton-${index}`} columns={3} />
                ))
              ) : contactLists.length > 0 ? (
                <>
                  {contactLists.map((contactList) => (
                    <TableRow key={contactList.id}>
                      <TableCell align="center">{contactList.name}</TableCell>
                      <TableCell align="center">
                        {contactList.contactsCount || 0}
                      </TableCell>
                      <TableCell align="center">
                        <a href={planilhaExemplo} download="planilha.xlsx">
                          <IconButton size="small" title="Baixar Planilha Exemplo">
                            <DownloadIcon />
                          </IconButton>
                        </a>

                        <IconButton
                          size="small"
                          onClick={() => goToContacts(contactList.id)}
                        >
                          <PeopleIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleEditContactList(contactList)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingContactList(contactList);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={3} />}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Nenhuma lista encontrada
                  </TableCell>
                </TableRow>
              )}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactLists;
