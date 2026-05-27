import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
  Checkbox,
  TextField,
} from "@material-ui/core";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { format } from "date-fns";
import JSZip from "jszip";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  parseWhatsAppExport,
  suggestParticipantMapping,
} from "../../utils/whatsappExportParser";

const useStyles = makeStyles((theme) => ({
  dialog: {
    minWidth: 560,
  },
  stepContent: {
    minHeight: 280,
    marginTop: theme.spacing(2),
  },
  fileDrop: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: 8,
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
  warning: {
    marginTop: theme.spacing(1),
    color: theme.palette.warning.main,
    fontSize: "0.85rem",
  },
  previewTable: {
    maxHeight: 220,
    overflow: "auto",
  },
  mappingRow: {
    marginBottom: theme.spacing(1.5),
  },
}));

const filter = createFilterOptions({ trim: true });
const STEPS = ["contact", "file", "mapping", "preview", "import"];

const countZipMediaFiles = (zip) =>
  Object.keys(zip.files).filter((name) => {
    if (zip.files[name].dir) return false;
    const base = name.split("/").pop();
    if (!base || /\.txt$/i.test(base)) return false;
    if (name.includes("__MACOSX")) return false;
    return /\.(jpe?g|png|gif|webp|mp4|mov|opus|ogg|mp3|m4a|aac|wav|pdf|doc|docx|ptt|stk|vid|aud|img|doc)/i.test(
      base
    ) || /^(IMG-|VID-|AUD-|PTT-|STK-|DOC-)/i.test(base);
  }).length;

const readTxtFromFile = async (file) => {
  if (file.name.toLowerCase().endsWith(".txt")) {
    return {
      text: await file.text(),
      txtFileName: file.name,
      zipMediaCount: 0,
    };
  }
  const zip = await JSZip.loadAsync(file);
  const txtNames = Object.keys(zip.files).filter(
    (n) => !zip.files[n].dir && /\.txt$/i.test(n) && !n.includes("__MACOSX")
  );
  if (!txtNames.length) {
    throw new Error(i18n.t("whatsappImport.errors.noTxtInZip"));
  }
  const txtName = txtNames.sort(
    (a, b) => (zip.files[b]._data?.uncompressedSize || 0) - (zip.files[a]._data?.uncompressedSize || 0)
  )[0];
  const text = await zip.file(txtName).async("string");
  return {
    text,
    txtFileName: txtName.split("/").pop(),
    zipMediaCount: countZipMediaFiles(zip),
  };
};

const ImportWhatsAppConversationModal = ({
  open,
  onClose,
  initialContact,
  onImported,
}) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { companyId, whatsappId: userWhatsappId } = user;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactOptions, setContactOptions] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({});

  const [uploadFile, setUploadFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [zipMediaCount, setZipMediaCount] = useState(0);
  const [participantMapping, setParticipantMapping] = useState({});
  const [ticketStatus, setTicketStatus] = useState("closed");
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [queues, setQueues] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [appendToExisting, setAppendToExisting] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (initialContact?.id) {
      setSelectedContact(initialContact);
      setContactOptions([initialContact]);
    }
  }, [open, initialContact]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const { data: wData } = await api.get("/whatsapp", { params: { companyId, session: 0 } });
        setWhatsapps(wData || []);
        if (userWhatsappId != null) setSelectedWhatsapp(userWhatsappId);
        if (user.profile !== "admin") {
          setQueues(user.queues || []);
          if (user.queues?.length === 1) setSelectedQueue(user.queues[0].id);
        } else {
          const { data: qData } = await api.get("/queue");
          setQueues(qData || []);
          if (qData?.length === 1) setSelectedQueue(qData[0].id);
        }
      } catch (err) {
        toastError(err);
      }
    };
    load();
  }, [open, companyId, user, userWhatsappId]);

  useEffect(() => {
    if (!open || searchParam.length < 3) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/contacts", { params: { searchParam } });
        setContactOptions(data.contacts || []);
      } catch (err) {
        toastError(err);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchParam, open]);

  const resetState = () => {
    setActiveStep(0);
    setUploadFile(null);
    setParseResult(null);
    setZipMediaCount(0);
    setParticipantMapping({});
    setTicketStatus("closed");
    setAppendToExisting(true);
    if (!initialContact?.id) {
      setSelectedContact(null);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".txt") && !ext.endsWith(".zip")) {
      toast.error(i18n.t("whatsappImport.errors.invalidExtension"));
      return;
    }
    if (file.size > 150 * 1024 * 1024) {
      toast.error(i18n.t("whatsappImport.errors.fileTooLarge"));
      return;
    }
    setLoading(true);
    try {
      const { text, txtFileName, zipMediaCount: zc } = await readTxtFromFile(file);
      const parsed = parseWhatsAppExport(text, { fileName: file.name, txtFileName });
      if (!parsed.messages.length) {
        toast.error(i18n.t("whatsappImport.errors.emptyChat"));
        return;
      }
      setUploadFile(file);
      setParseResult(parsed);
      setZipMediaCount(zc);
      const mapping = suggestParticipantMapping(
        parsed.participants,
        selectedContact?.name,
        parsed.chatTitleHint
      );
      setParticipantMapping(mapping);
      setActiveStep(2);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const previewMessages = useMemo(() => {
    if (!parseResult?.messages) return [];
    const msgs = parseResult.messages;
    if (msgs.length <= 12) return msgs;
    return [...msgs.slice(0, 6), ...msgs.slice(-6)];
  }, [parseResult]);

  const mediaMismatch =
    parseResult &&
    parseResult.mediaPlaceholderCount > 0 &&
    zipMediaCount < parseResult.mediaPlaceholderCount;

  const handleImport = async () => {
    if (!uploadFile || !selectedContact) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("contactId", String(selectedContact.id));
      form.append("ticketStatus", ticketStatus);
      form.append("participantMapping", JSON.stringify(participantMapping));
      form.append("appendToExisting", String(appendToExisting));
      if (selectedWhatsapp) form.append("whatsappId", String(selectedWhatsapp));
      if (selectedQueue) form.append("queueId", String(selectedQueue));

      const { data } = await api.post("/contacts/import-whatsapp", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        i18n.t("whatsappImport.success", {
          count: data.importedCount,
          media: data.mediaAttachedCount,
        })
      );
      if (onImported) onImported(data);
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const createAddContactOption = (opts, params) => {
    const filtered = filter(opts, params);
    if (params.inputValue?.trim() && searchParam.length >= 3) {
      filtered.push({ name: params.inputValue.trim(), isNew: true });
    }
    return filtered;
  };

  const renderContactStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          fullWidth
          options={contactOptions}
          value={selectedContact}
          getOptionLabel={(o) =>
            o?.number ? `${o.name} - ${o.number}` : o?.name || ""
          }
          onChange={(_, val) => {
            if (val?.isNew) {
              setNewContact({ name: val.name });
              setContactModalOpen(true);
            } else {
              setSelectedContact(val);
            }
          }}
          onInputChange={(_, v) => setSearchParam(v)}
          filterOptions={createAddContactOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t("whatsappImport.contactLabel")}
              variant="outlined"
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderFileStep = () => (
    <div>
      <label className={classes.fileDrop}>
        <input
          type="file"
          accept=".txt,.zip"
          className={classes.hiddenInput}
          onChange={handleFileChange}
        />
        <Typography>{i18n.t("whatsappImport.fileHint")}</Typography>
        {uploadFile && (
          <Typography variant="body2" style={{ marginTop: 8 }}>
            {uploadFile.name}
          </Typography>
        )}
      </label>
    </div>
  );

  const renderMappingStep = () => (
    <div>
      <Typography variant="body2" gutterBottom>
        {i18n.t("whatsappImport.mappingHint")}
      </Typography>
      {(parseResult?.participants || []).map((name) => (
        <div key={name} className={classes.mappingRow}>
          <Typography variant="subtitle2">{name}</Typography>
          <RadioGroup
            row
            value={participantMapping[name] || "contact"}
            onChange={(e) =>
              setParticipantMapping((prev) => ({
                ...prev,
                [name]: e.target.value,
              }))
            }
          >
            <FormControlLabel
              value="contact"
              control={<Radio color="primary" size="small" />}
              label={i18n.t("whatsappImport.sideContact")}
            />
            <FormControlLabel
              value="me"
              control={<Radio color="primary" size="small" />}
              label={i18n.t("whatsappImport.sideMe")}
            />
          </RadioGroup>
        </div>
      ))}
    </div>
  );

  const renderPreviewStep = () => (
    <div>
      <Typography variant="body2" gutterBottom>
        {i18n.t("whatsappImport.stats", {
          total: parseResult?.messages?.length || 0,
          media: parseResult?.mediaPlaceholderCount || 0,
          zipMedia: zipMediaCount,
        })}
      </Typography>
      {mediaMismatch && (
        <Typography className={classes.warning}>
          {i18n.t("whatsappImport.mediaMismatch")}
        </Typography>
      )}
      <FormControl variant="outlined" fullWidth margin="dense">
        <InputLabel>{i18n.t("whatsappImport.ticketStatus")}</InputLabel>
        <Select
          value={ticketStatus}
          onChange={(e) => setTicketStatus(e.target.value)}
          label={i18n.t("whatsappImport.ticketStatus")}
        >
          <MenuItem value="open">{i18n.t("whatsappImport.statusOpen")}</MenuItem>
          <MenuItem value="pending">{i18n.t("whatsappImport.statusPending")}</MenuItem>
          <MenuItem value="closed">{i18n.t("whatsappImport.statusClosed")}</MenuItem>
        </Select>
      </FormControl>
      {queues.length > 0 && (
        <FormControl variant="outlined" fullWidth margin="dense">
          <InputLabel>{i18n.t("newTicketModal.selectQueue")}</InputLabel>
          <Select
            value={selectedQueue}
            onChange={(e) => setSelectedQueue(e.target.value)}
            label={i18n.t("newTicketModal.selectQueue")}
          >
            <MenuItem value="">
              <em>—</em>
            </MenuItem>
            {queues.map((q) => (
              <MenuItem key={q.id} value={q.id}>
                {q.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {whatsapps.length > 1 && (
        <FormControl variant="outlined" fullWidth margin="dense">
          <InputLabel>{i18n.t("newTicketModal.selectConection")}</InputLabel>
          <Select
            value={selectedWhatsapp}
            onChange={(e) => setSelectedWhatsapp(e.target.value)}
            label={i18n.t("newTicketModal.selectConection")}
          >
            {whatsapps.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                <ListItemText primary={w.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={appendToExisting}
            onChange={(e) => setAppendToExisting(e.target.checked)}
            color="primary"
          />
        }
        label={i18n.t("whatsappImport.appendToExisting")}
      />
      <div className={classes.previewTable}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("whatsappImport.colDate")}</TableCell>
              <TableCell>{i18n.t("whatsappImport.colAuthor")}</TableCell>
              <TableCell>{i18n.t("whatsappImport.colSide")}</TableCell>
              <TableCell>{i18n.t("whatsappImport.colBody")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {previewMessages.map((m, idx) => {
              const side = participantMapping[m.author] || "contact";
              return (
                <TableRow key={`${m.datetime}-${idx}`}>
                  <TableCell>
                    {m.datetime && m.datetime.getTime()
                      ? format(m.datetime, "dd/MM/yyyy HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell>{m.author || "—"}</TableCell>
                  <TableCell>
                    {side === "me"
                      ? i18n.t("whatsappImport.sideMe")
                      : i18n.t("whatsappImport.sideContact")}
                  </TableCell>
                  <TableCell>
                    {m.isMedia
                      ? i18n.t("whatsappImport.mediaLabel")
                      : (m.body || "").slice(0, 80)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const canNext = () => {
    if (activeStep === 0) return Boolean(selectedContact?.id);
    if (activeStep === 1) return Boolean(parseResult);
    if (activeStep === 2) return (parseResult?.participants || []).length > 0;
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) setActiveStep(1);
    else if (activeStep === 1 && parseResult) setActiveStep(2);
    else if (activeStep === 2) setActiveStep(3);
    else if (activeStep === 3) handleImport();
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  return (
    <>
      <ContactModal
        open={contactModalOpen}
        initialValues={newContact}
        onClose={() => setContactModalOpen(false)}
        onSave={(contact) => {
          setSelectedContact(contact);
          setContactModalOpen(false);
        }}
      />
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{i18n.t("whatsappImport.title")}</DialogTitle>
        <DialogContent className={classes.dialog}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.slice(0, 4).map((key) => (
              <Step key={key}>
                <StepLabel>{i18n.t(`whatsappImport.steps.${key}`)}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div className={classes.stepContent}>
            {activeStep === 0 && renderContactStep()}
            {activeStep === 1 && renderFileStep()}
            {activeStep === 2 && renderMappingStep()}
            {activeStep === 3 && renderPreviewStep()}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {i18n.t("whatsappImport.cancel")}
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              {i18n.t("whatsappImport.back")}
            </Button>
          )}
          {activeStep < 3 ? (
            <Button
              color="primary"
              variant="contained"
              onClick={handleNext}
              disabled={!canNext() || loading}
            >
              {i18n.t("whatsappImport.next")}
            </Button>
          ) : (
            <ButtonWithSpinner
              color="primary"
              variant="contained"
              onClick={handleImport}
              loading={loading}
            >
              {i18n.t("whatsappImport.import")}
            </ButtonWithSpinner>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportWhatsAppConversationModal;
