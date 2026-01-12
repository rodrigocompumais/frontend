import React, { useState, useEffect, useRef, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PersonIcon from "@material-ui/icons/Person";
import PhoneIcon from "@material-ui/icons/Phone";
import EmailIcon from "@material-ui/icons/Email";
import AddIcon from "@material-ui/icons/Add";
import DescriptionIcon from "@material-ui/icons/Description";

import { i18n } from "../../translate/i18n";
import moment from "moment";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Chip,
  Menu,
  Button,
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import CampaignAIModal from "../CampaignAIModal";
import GeminiIcon from "../GeminiIcon";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "#fff"
  },

  tabmsg: {
    backgroundColor: theme.palette.campaigntab,
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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

  variablesContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
  },

  variableButton: {
    margin: theme.spacing(0.5),
    textTransform: 'none',
    fontWeight: 500,
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },

  variablesTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
}));

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("campaigns.dialog.form.nameShort"))
    .max(50, i18n.t("campaigns.dialog.form.nameLong"))
    .required(i18n.t("campaigns.dialog.form.nameRequired")),
});

const CampaignModal = ({
  open,
  onClose,
  campaignId,
  initialValues,
  onSave,
  resetPagination,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const [file, setFile] = useState(null);

  const initialState = {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    status: "INATIVA", // INATIVA, PROGRAMADA, EM_ANDAMENTO, CANCELADA, FINALIZADA,
    scheduledAt: "",
    whatsappId: "",
    contactListId: "",
    tagListId: "Nenhuma",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);
  const [tagLists, setTagLists] = useState([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [messageFieldRefs, setMessageFieldRefs] = useState({});
  const [forms, setForms] = useState([]);
  const [formLinkMenuAnchor, setFormLinkMenuAnchor] = useState({});

  // Função para inserir variável no campo de texto
  const insertVariable = (fieldName, variable) => {
    const inputElement = document.getElementById(fieldName);
    if (inputElement) {
      const cursorPosition = inputElement.selectionStart || 0;
      const currentValue = campaign[fieldName] || '';
      const newValue = 
        currentValue.substring(0, cursorPosition) + 
        variable + 
        currentValue.substring(cursorPosition);
      
      setCampaign(prev => ({
        ...prev,
        [fieldName]: newValue
      }));

      // Focar e reposicionar o cursor após a variável inserida
      setTimeout(() => {
        inputElement.focus();
        const newPosition = cursorPosition + variable.length;
        inputElement.setSelectionRange(newPosition, newPosition);
      }, 10);
    }
  };

  // Função para inserir link de formulário
  const insertFormLink = (fieldName, form) => {
    const formLink = `${window.location.origin}/f/${form.slug}`;
    insertVariable(fieldName, formLink);
    setFormLinkMenuAnchor(prev => ({ ...prev, [fieldName]: null }));
  };

  // Função para abrir menu de seleção de formulário
  const handleFormLinkMenuOpen = (fieldName, event) => {
    setFormLinkMenuAnchor(prev => ({ ...prev, [fieldName]: event.currentTarget }));
  };

  // Função para fechar menu de seleção de formulário
  const handleFormLinkMenuClose = (fieldName) => {
    setFormLinkMenuAnchor(prev => ({ ...prev, [fieldName]: null }));
  };

  const variables = [
    { label: 'Nome', value: '{{name}}', icon: <PersonIcon fontSize="small" />, color: 'primary' },
    { label: 'Telefone', value: '{{number}}', icon: <PhoneIcon fontSize="small" />, color: 'secondary' },
    { label: 'Email', value: '{{email}}', icon: <EmailIcon fontSize="small" />, color: 'default' },
  ];

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId }
        });

        setFile(data.files);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      api
        .get(`/contact-lists/list`, { params: { companyId } })
        .then(({ data }) => setContactLists(data));

      api
        .get(`/whatsapp`, { params: { companyId, session: 0 } })
        .then(({ data }) => setWhatsapps(data));

      api.get(`/tags`, { params: { companyId } })
        .then(({ data }) => {
          const fetchedTags = data.tags;
          // Perform any necessary data transformation here
          const formattedTagLists = fetchedTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setTagLists(formattedTagLists);
        })
        .catch((error) => {
          console.error("Error retrieving tags:", error);
        });

      // Fetch active forms
      api.get(`/forms`, { params: { pageNumber: 1 } })
        .then(({ data }) => {
          const activeForms = (data.forms || []).filter(form => form.isActive);
          setForms(activeForms);
        })
        .catch((error) => {
          console.error("Error retrieving forms:", error);
        });
        
      if (!campaignId) return;

      api.get(`/campaigns/${campaignId}`).then(({ data }) => {
        setCampaign((prev) => {
          let prevCampaignData = Object.assign({}, prev);

          Object.entries(data).forEach(([key, value]) => {
            if (key === "scheduledAt" && value !== "" && value !== null) {
              prevCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
            } else {
              prevCampaignData[key] = value === null ? "" : value;
            }
          });

          return {...prevCampaignData, tagListId: data.tagId || "Nenhuma"};
        });
      });
    }
  }, [campaignId, open, initialValues, companyId]);

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "INATIVA" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {};
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const renderMessageField = (identifier) => {
    return (
      <>
        <Field
          as={TextField}
          id={identifier}
          name={identifier}
          fullWidth
          rows={5}
          label={i18n.t(`campaigns.dialog.form.${identifier}`)}
          placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
          multiline={true}
          variant="outlined"
          disabled={!campaignEditable && campaign.status !== "CANCELADA"}
        />
        
        {campaignEditable && (
          <Box className={classes.variablesContainer}>
            <Typography className={classes.variablesTitle}>
              <AddIcon fontSize="small" />
              Inserir Variáveis:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
              {variables.map((variable) => (
                <Chip
                  key={variable.value}
                  icon={variable.icon}
                  label={variable.label}
                  onClick={() => insertVariable(identifier, variable.value)}
                  color={variable.color}
                  variant="outlined"
                  clickable
                  className={classes.variableButton}
                  size="small"
                />
              ))}
              {forms.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DescriptionIcon fontSize="small" />}
                    onClick={(e) => handleFormLinkMenuOpen(identifier, e)}
                    className={classes.variableButton}
                    style={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    Link de Formulário
                  </Button>
                  <Menu
                    anchorEl={formLinkMenuAnchor[identifier]}
                    open={Boolean(formLinkMenuAnchor[identifier])}
                    onClose={() => handleFormLinkMenuClose(identifier)}
                    PaperProps={{
                      style: {
                        maxHeight: 300,
                        width: '250px',
                      },
                    }}
                  >
                    {forms.map((form) => (
                      <MenuItem
                        key={form.id}
                        onClick={() => insertFormLink(identifier, form)}
                      >
                        <Box>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>
                            {form.name}
                          </Typography>
                          {form.description && (
                            <Typography variant="caption" color="textSecondary">
                              {form.description.length > 40 
                                ? form.description.substring(0, 40) + '...'
                                : form.description}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
            <Typography 
              variant="caption" 
              color="textSecondary"
              style={{ marginTop: 8, display: 'block' }}
            >
              Clique em uma variável ou selecione um formulário para inserir no texto da mensagem
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const handleApplyAIMessages = (messages) => {
    // Mensagens: [message1, message2, message3, message4, message5]
    const [msg1, msg2, msg3, msg4, msg5] = messages;
    
    setCampaign(prev => ({
      ...prev,
      message1: msg1 || prev.message1,
      message2: msg2 || prev.message2,
      message3: msg3 || prev.message3,
      message4: msg4 || prev.message4,
      message5: msg5 || prev.message5,
    }));
    
    // Voltar para a primeira aba para ver o resultado
    setMessageTab(0);
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignAIModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApply={handleApplyAIMessages}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {campaignEditable ? (
            <>
              {campaignId
                ? `${i18n.t("campaigns.dialog.update")}`
                : `${i18n.t("campaigns.dialog.new")}`}
            </>
          ) : (
            <>{`${i18n.t("campaigns.dialog.readonly")}`}</>
          )}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Grid spacing={2} container>
                  <Grid xs={12} md={9} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="contactList-selection-label">
                        {i18n.t("campaigns.dialog.form.contactList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.contactList")}
                        placeholder={i18n.t(
                          "campaigns.dialog.form.contactList"
                        )}
                        labelId="contactList-selection-label"
                        id="contactListId"
                        name="contactListId"
                        error={
                          touched.contactListId && Boolean(errors.contactListId)
                        }
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {contactLists &&
                          contactLists.map((contactList) => (
                            <MenuItem
                              key={contactList.id}
                              value={contactList.id}
                            >
                              {contactList.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="tagList-selection-label">
                        {i18n.t("campaigns.dialog.form.tagList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.tagList")}
                        placeholder={i18n.t("campaigns.dialog.form.tagList")}
                        labelId="tagList-selection-label"
                        id="tagListId"
                        name="tagListId"
                        error={touched.tagListId && Boolean(errors.tagListId)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {Array.isArray(tagLists) &&
                          tagLists.map((tagList) => (
                            <MenuItem key={tagList.id} value={tagList.id}>
                              {tagList.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="whatsapp-selection-label">
                        {i18n.t("campaigns.dialog.form.whatsapp")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.whatsapp")}
                        placeholder={i18n.t("campaigns.dialog.form.whatsapp")}
                        labelId="whatsapp-selection-label"
                        id="whatsappId"
                        name="whatsappId"
                        error={touched.whatsappId && Boolean(errors.whatsappId)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {whatsapps &&
                          whatsapps.map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                      helperText={touched.scheduledAt && errors.scheduledAt}
                      variant="outlined"
                      margin="dense"
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                  <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.FormControl}
                      fullWidth
                    >
                      <InputLabel id="fileListId-selection-label">{i18n.t("campaigns.dialog.form.fileList")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.fileList")}
                        name="fileListId"
                        id="fileListId"
                        placeholder={i18n.t("campaigns.dialog.form.fileList")}
                        labelId="fileListId-selection-label"
                        value={values.fileListId || ""}
                      >
                        <MenuItem value={""} >{"Nenhum"}</MenuItem>
                        {file.map(f => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} item>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Mensagens da Campanha
                      </Typography>
                      {campaignEditable && (
                        <Tooltip title="Gerar mensagens com IA - Compuchat">
                          <IconButton
                            onClick={() => setAiModalOpen(true)}
                            color="primary"
                            size="small"
                            style={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "#fff",
                              padding: "8px",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <GeminiIcon size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Tabs
                      value={messageTab}
                      indicatorColor="primary"
                      textColor="primary"
                      className={classes.tabmsg}
                      onChange={(e, v) => setMessageTab(v)}
                      variant="fullWidth"
                      centered
                      style={{
                        borderRadius: 2,
                      }}
                    >
                      <Tab label="Msg. 1" index={0} />
                      <Tab label="Msg. 2" index={1} />
                      <Tab label="Msg. 3" index={2} />
                      <Tab label="Msg. 4" index={3} />
                      <Tab label="Msg. 5" index={4} />
                    </Tabs>
                    <Box style={{ paddingTop: 20, border: "none" }}>
                      {messageTab === 0 && (
                        <>{renderMessageField("message1")}</>
                      )}
                      {messageTab === 1 && (
                        <>{renderMessageField("message2")}</>
                      )}
                      {messageTab === 2 && (
                        <>{renderMessageField("message3")}</>
                      )}
                      {messageTab === 3 && (
                        <>{renderMessageField("message4")}</>
                      )}
                      {messageTab === 4 && (
                        <>{renderMessageField("message5")}</>
                      )}
                    </Box>
                  </Grid>
                  {(campaign.mediaPath || attachment) && (
                    <Grid xs={12} item>
                      <Button startIcon={<AttachFileIcon />}>
                        {attachment != null
                          ? attachment.name
                          : campaign.mediaName}
                      </Button>
                      {campaignEditable && (
                        <IconButton
                          onClick={() => setConfirmationOpen(true)}
                          color="secondary"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {campaign.status === "CANCELADA" && (
                  <Button
                    color="primary"
                    onClick={() => restartCampaign()}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.restart")}
                  </Button>
                )}
                {campaign.status === "EM_ANDAMENTO" && (
                  <Button
                    color="primary"
                    onClick={() => cancelCampaign()}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.cancel")}
                  </Button>
                )}
                {!attachment && !campaign.mediaPath && campaignEditable && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>
                {(campaignEditable || campaign.status === "CANCELADA") && (
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={classes.btnWrapper}
                  >
                    {campaignId
                      ? `${i18n.t("campaigns.dialog.buttons.edit")}`
                      : `${i18n.t("campaigns.dialog.buttons.add")}`}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CampaignModal;
