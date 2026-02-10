import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Box from "@material-ui/core/Box";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactAvatarModal from "../../components/ContactAvatarModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import {CSVLink} from "react-csv";
import ImportContactsModal from "../../components/ImportContactsModal";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    // Para paginação tradicional, substituir os contatos ao invés de adicionar
    return action.payload;
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
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
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  pageButton: {
    minWidth: 40,
    padding: theme.spacing(0.5, 1),
  },
  activePageButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [openModalImport, setOpenModalImport] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const limit = 30; // Mesmo limite usado no backend
  const totalPages = Math.ceil(totalCount / limit);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setTotalCount(data.count || 0);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
          setHasMore(false);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  // const handleSaveTicket = async contactId => {
  // 	if (!contactId) return;
  // 	setLoading(true);
  // 	try {
  // 		const { data: ticket } = await api.post("/tickets", {
  // 			contactId: contactId,
  // 			userId: user?.id,
  // 			status: "open",
  // 		});
  // 		history.push(`/tickets/${ticket.id}`);
  // 	} catch (err) {
  // 		toastError(err);
  // 	}
  // 	setLoading(false);
  // };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenImportModal = (  ) => {
    setOpenModalImport(true);
  }

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

  const handleCloseModalImport = (  ) => {
    setOpenModalImport(false);
  }

  return (
    <MainContainer className={classes.mainContainer}>
      <ImportContactsModal
        open={openModalImport}
        onClose={handleCloseModalImport}
      />
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader className="tour-contacts-page">
        <Title>{i18n.t("contacts.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
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
          {/*<Button
            variant="contained"
            color="primary"
            onClick={(e) => setConfirmOpen(true)}
          >
            {i18n.t("contacts.buttons.import")}
          </Button>*/}
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenImportModal}
          >
            {i18n.t("contacts.buttons.import")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>
         <CSVLink style={{ textDecoration:'none'}} separator=";" filename={'contatos.csv'} data={contacts.map((contact) => ({ name: contact.name, number: contact.number, email: contact.email }))}>
          <Button	variant="contained" color="primary"> 
            {i18n.t("contacts.buttons.export")}
          </Button>
          </CSVLink>		  

        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.whatsapp")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.email")}
              </TableCell>
              <TableCell align="center">
                Usuário Responsável
              </TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell style={{ paddingRight: 0 }}>
                    <Avatar 
                      src={contact.profilePicUrl}
                      onClick={() => {
                        setSelectedContact(contact);
                        setAvatarModalOpen(true);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell align="center">{contact.number}</TableCell>
                  <TableCell align="center">{contact.email}</TableCell>
                  <TableCell align="center">
                    {contact.user ? contact.user.name : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setContactTicket(contact);
                        setNewTicketModalOpen(true);
                      }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => hadleEditContact(contact.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmOpen(true);
                            setDeletingContact(contact);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
              {!loading && contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {i18n.t("contacts.noContacts") || "Nenhum contato encontrado"}
                  </TableCell>
                </TableRow>
              )}
            </>
          </TableBody>
        </Table>
      </Paper>
      {totalPages > 1 && (
        <Box className={classes.paginationContainer}>
          <IconButton
            onClick={handlePreviousPage}
            disabled={pageNumber === 1 || loading}
            size="small"
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
                color="primary"
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
          >
            <ChevronRightIcon />
          </IconButton>
          <Box style={{ marginLeft: 16, fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.54)" }}>
            {totalCount > 0 && (
              <span>
                Página {pageNumber} de {totalPages} ({totalCount} {totalCount === 1 ? "contato" : "contatos"})
              </span>
            )}
          </Box>
        </Box>
      )}
      <ContactAvatarModal
        open={avatarModalOpen}
        onClose={() => {
          setAvatarModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
      />
    </MainContainer>
  );
};

export default Contacts;
