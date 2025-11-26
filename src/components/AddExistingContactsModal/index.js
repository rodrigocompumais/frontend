import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Avatar from "@material-ui/core/Avatar";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TableRowSkeleton from "../TableRowSkeleton";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minHeight: 400,
    maxHeight: 500,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    overflowY: "auto",
    maxHeight: 350,
    ...theme.scrollbarStyles,
  },
  selectedCount: {
    marginLeft: theme.spacing(2),
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  selectAllButton: {
    marginLeft: theme.spacing(1),
  },
}));

const AddExistingContactsModal = ({ open, onClose, contactListId }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!open) {
      dispatch({ type: "RESET" });
      setSelectedIds([]);
      setSearchParam("");
      setPageNumber(1);
      return;
    }
  }, [open]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, open]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleToggleContact = (contactId) => {
    setSelectedIds((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber((prevState) => prevState + 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.warning(i18n.t("addExistingContactsModal.toasts.noSelection"));
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/contact-list-items/bulk", {
        contactIds: selectedIds,
        contactListId,
      });

      toast.success(
        i18n.t("addExistingContactsModal.toasts.success", {
          count: data.created,
          skipped: data.skipped,
        })
      );
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const isAllSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        {i18n.t("addExistingContactsModal.title")}
        {selectedIds.length > 0 && (
          <Typography component="span" className={classes.selectedCount}>
            ({i18n.t("addExistingContactsModal.selectedCount", { count: selectedIds.length })})
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <Box className={classes.headerActions}>
          <TextField
            placeholder={i18n.t("addExistingContactsModal.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            className={classes.searchField}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box className={classes.headerActions}>
          <Button
            size="small"
            color="primary"
            onClick={handleSelectAll}
            className={classes.selectAllButton}
          >
            {isAllSelected
              ? i18n.t("addExistingContactsModal.buttons.clearSelection")
              : i18n.t("addExistingContactsModal.buttons.selectAll")}
          </Button>
        </Box>
        <div className={classes.tableContainer} onScroll={handleScroll}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
                <TableCell padding="checkbox" />
                <TableCell>{i18n.t("addExistingContactsModal.table.name")}</TableCell>
                <TableCell align="center">
                  {i18n.t("addExistingContactsModal.table.number")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("addExistingContactsModal.table.email")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  hover
                  onClick={() => handleToggleContact(contact.id)}
                  style={{ cursor: "pointer" }}
                  selected={selectedIds.includes(contact.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(contact.id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell style={{ paddingRight: 0 }}>
                    <Avatar src={contact.profilePicUrl} />
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell align="center">{contact.number}</TableCell>
                  <TableCell align="center">{contact.email}</TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={4} />}
            </TableBody>
          </Table>
          {!loading && contacts.length === 0 && (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography color="textSecondary">
                {i18n.t("addExistingContactsModal.noContacts")}
              </Typography>
            </Box>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="secondary"
          disabled={submitting}
          variant="outlined"
        >
          {i18n.t("addExistingContactsModal.buttons.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={submitting || selectedIds.length === 0}
          variant="contained"
          className={classes.btnWrapper}
        >
          {i18n.t("addExistingContactsModal.buttons.add", { count: selectedIds.length })}
          {submitting && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExistingContactsModal;

