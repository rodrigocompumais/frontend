import React, { useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { Formik, Form } from "formik";

import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";


import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";

import useStyles from "./styles";
import Invoices from "../../pages/Financeiro";
import { i18n } from "../../translate/i18n";


export default function CheckoutPage(props) {
  const steps = [i18n.t("checkoutPage.steps.data"), i18n.t("checkoutPage.steps.customize"), i18n.t("checkoutPage.steps.review")];
  const { formId, formField } = checkoutFormModel;
  
  
  
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId, setinvoiceId] = useState(props.Invoice.id);
  const [paymentMethod, setPaymentMethod] = useState("PIX"); // "PIX" | "CARD"
  const [recurringPayment, setRecurringPayment] = useState(false);
  /** Clientes sem asaasCustomerId precisam informar CPF/CNPJ uma vez */
  const [showCpfForm, setShowCpfForm] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cpfLoading, setCpfLoading] = useState(false);
  /** Dados da empresa incompletos para Asaas — modal de edição */
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [companyIssues, setCompanyIssues] = useState([]);
  const [companySaving, setCompanySaving] = useState(false);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const { user } = useContext(AuthContext);

function _renderStepContent(step, setFieldValue, setActiveStep, values ) {

  switch (step) {
    case 0:
      return <AddressForm formField={formField} values={values} setFieldValue={setFieldValue}  />;
    case 1:
      return <PaymentForm
      formField={formField} 
      setFieldValue={setFieldValue} 
      setActiveStep={setActiveStep} 
      activeStep={step} 
      invoiceId={invoiceId}
      values={values}
      />;
    case 2:
      return <ReviewOrder />;
    default:
      return <div>Not Found</div>;
  }
}


  function openCompanyDataModal(data) {
    if (data.company) {
      setCompanyForm({
        name: data.company.name || "",
        email: data.company.email || "",
        phone: data.company.phone || "",
      });
    }
    setCompanyIssues(data.issues || []);
    setCompanyModalOpen(true);
  }

  async function _submitForm(values, actions) {
    try {
      if (paymentMethod === "CARD") {
        await handlePayWithCard(values, actions);
        return;
      }
      if (props.onPaymentStart) props.onPaymentStart(invoiceId);
      const { data } = await api.post("/asaas/invoice-payment", {
        invoiceId,
      });
      if (data.requiresCompanyData) {
        openCompanyDataModal(data);
        actions.setSubmitting(false);
        if (props.onPaymentEnd) props.onPaymentEnd();
        return;
      }
      if (data.requiresCpfCnpj) {
        setShowCpfForm(true);
        actions.setSubmitting(false);
        if (props.onPaymentEnd) props.onPaymentEnd();
        return;
      }
      if (data.asaas && data.pixPayload) {
        setDatePayment(data);
        actions.setSubmitting(false);
        setActiveStep(activeStep + 1);
        toast.success(i18n.t("checkoutPage.success"));
        return;
      }
      toast.error("Resposta inesperada do servidor de pagamento.");
      if (props.onPaymentEnd) props.onPaymentEnd();
    } catch (err) {
      const resp = err?.response?.data;
      if (props.onPaymentEnd) props.onPaymentEnd();
      if (resp?.requiresCompanyData) {
        openCompanyDataModal(resp);
      } else {
        toastError(err);
      }
    }
    actions.setSubmitting(false);
  }

  async function handlePayWithCard(values, actions) {
    try {
      if (props.onPaymentStart) props.onPaymentStart(invoiceId);
      const payload = {
        invoiceId,
        recurring: recurringPayment,
        cpfCnpj: values?.cpfCnpj || "",
        card: {
          holderName: values.cardHolderName || values.billingName || "",
          number: values.cardNumber || "",
          expiryMonth: values.cardExpiryMonth || "",
          expiryYear: values.cardExpiryYear || "",
          ccv: values.cardCcv || "",
        },
        billingPostalCode: values.billingPostalCode || values.zipcode || "",
        billingAddressNumber: values.billingAddressNumber || "S/N",
        billingAddressComplement: values.billingAddressComplement || "",
        billingName: values.billingName || values.firstName || "",
        billingEmail: values.billingEmail || values.email || user?.company?.email,
        billingPhone: values.billingPhone || user?.company?.phone,
      };
      const { data } = await api.post("/asaas/invoice-payment-card", payload);
      if (data.requiresCompanyData) {
        openCompanyDataModal(data);
        actions.setSubmitting(false);
        if (props.onPaymentEnd) props.onPaymentEnd();
        return;
      }
      if (data.requiresCpfCnpj) {
        toast.error(
          data.message ||
            "Informe CPF ou CNPJ do titular do cartão para processar o pagamento."
        );
        actions.setSubmitting(false);
        if (props.onPaymentEnd) props.onPaymentEnd();
        return;
      }
      if (data.asaas && data.paymentId) {
        setDatePayment({ ...data, billingType: "CREDIT_CARD" });
        actions.setSubmitting(false);
        setActiveStep(activeStep + 1);
        toast.success("Pagamento com cartão enviado para processamento.");
        return;
      }
      toast.error(data.message || "Resposta inesperada do servidor de cartão.");
      if (props.onPaymentEnd) props.onPaymentEnd();
    } catch (err) {
      if (props.onPaymentEnd) props.onPaymentEnd();
      toastError(err);
    }
    actions.setSubmitting(false);
  }

  async function handleGeneratePixWithCpf() {
    const digits = (cpfCnpj || "").replace(/\D/g, "");
    if (digits.length !== 11 && digits.length !== 14) {
      toast.error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setCpfLoading(true);
    try {
      const { data } = await api.post("/asaas/invoice-payment", {
        invoiceId,
        cpfCnpj: digits,
      });
      if (data.requiresCompanyData) {
        openCompanyDataModal(data);
        setCpfLoading(false);
        return;
      }
      if (data.asaas && data.pixPayload) {
        setDatePayment(data);
        setShowCpfForm(false);
        setActiveStep(steps.length);
        toast.success(i18n.t("checkoutPage.success"));
      } else {
        toast.error(data.message || "Não foi possível gerar o PIX.");
      }
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.requiresCompanyData) {
        openCompanyDataModal(resp);
      } else {
        toastError(err);
      }
    }
    setCpfLoading(false);
  }

  async function handleSaveCompanyProfile() {
    const digits = (companyForm.phone || "").replace(/\D/g, "");
    if (!companyForm.name?.trim() || companyForm.name.trim().length < 2) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    if (!companyForm.email?.trim()) {
      toast.error("Informe o e-mail.");
      return;
    }
    if (digits.length !== 11 && digits.length !== 10) {
      toast.error("Celular inválido. Use DDD + número (10 ou 11 dígitos).");
      return;
    }
    setCompanySaving(true);
    try {
      await api.put("/asaas/company-profile", {
        name: companyForm.name.trim(),
        email: companyForm.email.trim(),
        phone: digits,
      });
      setCompanyModalOpen(false);
      toast.success("Dados atualizados. Gerando PIX…");
      // Retenta fluxo: se estava no CPF, gera de novo com mesmo CPF; senão só invoice
      if (showCpfForm && cpfCnpj) {
        await handleGeneratePixWithCpf();
      } else {
        const { data } = await api.post("/asaas/invoice-payment", { invoiceId });
        if (data.requiresCpfCnpj) {
          setShowCpfForm(true);
        } else if (data.asaas && data.pixPayload) {
          setDatePayment(data);
          setActiveStep(steps.length);
          toast.success(i18n.t("checkoutPage.success"));
        } else if (data.requiresCompanyData) {
          openCompanyDataModal(data);
        }
      }
    } catch (err) {
      toastError(err);
    }
    setCompanySaving(false);
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <React.Fragment>
      <Dialog
        open={companyModalOpen}
        onClose={() => !companySaving && setCompanyModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Dados da empresa para pagamento PIX</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            O Asaas exige nome, e-mail e celular válidos (DDD + número, 10 ou 11
            dígitos). Corrija abaixo e salve para gerar o PIX.
          </Typography>
          {companyIssues.length > 0 && (
            <Box mb={2}>
              {companyIssues.map((issue, i) => (
                <Typography key={i} color="error" variant="body2">
                  • {issue.message}
                </Typography>
              ))}
            </Box>
          )}
          <TextField
            fullWidth
            label="Nome da empresa"
            value={companyForm.name}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, name: e.target.value }))
            }
            margin="normal"
            variant="outlined"
            disabled={companySaving}
          />
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={companyForm.email}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, email: e.target.value }))
            }
            margin="normal"
            variant="outlined"
            disabled={companySaving}
          />
          <TextField
            fullWidth
            label="Celular (DDD + número)"
            value={companyForm.phone}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, phone: e.target.value }))
            }
            placeholder="11999998888"
            margin="normal"
            variant="outlined"
            disabled={companySaving}
            helperText="Somente números ou com máscara — 11 dígitos para celular"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCompanyModalOpen(false)}
            disabled={companySaving}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSaveCompanyProfile}
            disabled={companySaving}
          >
            {companySaving ? <CircularProgress size={24} /> : "Salvar e gerar PIX"}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography component="h1" variant="h4" align="center">
        {i18n.t("checkoutPage.closeToEnd")}
      </Typography>
      <Box display="flex" justifyContent="center" mb={2} mt={1}>
        <Button
          variant={paymentMethod === "PIX" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setPaymentMethod("PIX")}
          style={{ marginRight: 8 }}
        >
          PIX
        </Button>
        <Button
          variant={paymentMethod === "CARD" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setPaymentMethod("CARD")}
        >
          Cartão de crédito
        </Button>
      </Box>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <CheckoutSuccess
            pix={datePayment}
            invoiceId={invoiceId}
            onCloseSuccess={() => { if (props.onPaymentSuccess) props.onPaymentSuccess(invoiceId); }}
            isInsideModal={props.isInsideModal}
          />
        ) : showCpfForm ? (
          <Box style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h6" gutterBottom align="center">
              Cadastro para pagamento PIX
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              paragraph
              align="center"
            >
              Sua conta ainda não possui cadastro no Asaas. Informe o CPF ou
              CNPJ do titular para gerar o PIX desta fatura. O dado é usado
              apenas para criar o cliente no Asaas e não será solicitado
              novamente nas próximas cobranças.
            </Typography>
            <TextField
              fullWidth
              label="CPF ou CNPJ"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              placeholder="Somente números ou com máscara"
              variant="outlined"
              margin="normal"
              disabled={cpfLoading}
            />
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button onClick={() => setShowCpfForm(false)} disabled={cpfLoading}>
                Voltar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGeneratePixWithCpf}
                disabled={cpfLoading}
              >
                {cpfLoading ? <CircularProgress size={24} /> : "Gerar PIX"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Formik
            initialValues={{
              ...user, 
              ...formInitialValues
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(activeStep, setFieldValue, setActiveStep, values)}

                {paymentMethod === "CARD" && activeStep === 2 && (
                  <Box mt={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={recurringPayment}
                          onChange={(e) => setRecurringPayment(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Ativar cobrança recorrente (pagamento automático todo mês)"
                    />
                    <Typography variant="h6" gutterBottom style={{ marginTop: 12 }}>
                      Dados do cartão de crédito
                    </Typography>
                    <Box display="flex" flexDirection="column" gridGap={12}>
                      <TextField
                        label="CPF ou CNPJ do titular"
                        fullWidth
                        margin="dense"
                        placeholder="Somente números"
                        value={values.cpfCnpj || ""}
                        onChange={(e) => setFieldValue("cpfCnpj", e.target.value)}
                        helperText="CPF (11 dígitos) ou CNPJ (14 dígitos) do titular do cartão."
                      />
                      <TextField
                        label="Nome no cartão"
                        fullWidth
                        margin="dense"
                        value={values.cardHolderName || ""}
                        onChange={(e) => setFieldValue("cardHolderName", e.target.value)}
                      />
                      <TextField
                        label="Número do cartão"
                        fullWidth
                        margin="dense"
                        placeholder="0000 0000 0000 0000"
                        value={values.cardNumber || ""}
                        onChange={(e) => setFieldValue("cardNumber", e.target.value)}
                      />
                      <Box display="flex" gridGap={12}>
                        <TextField
                          label="Mês (MM)"
                          margin="dense"
                          style={{ flex: 1 }}
                          value={values.cardExpiryMonth || ""}
                          onChange={(e) => setFieldValue("cardExpiryMonth", e.target.value)}
                        />
                        <TextField
                          label="Ano (AAAA)"
                          margin="dense"
                          style={{ flex: 1 }}
                          value={values.cardExpiryYear || ""}
                          onChange={(e) => setFieldValue("cardExpiryYear", e.target.value)}
                        />
                        <TextField
                          label="CVV"
                          margin="dense"
                          style={{ flex: 1 }}
                          value={values.cardCcv || ""}
                          onChange={(e) => setFieldValue("cardCcv", e.target.value)}
                        />
                      </Box>
                      <Typography variant="subtitle1" style={{ marginTop: 8 }}>
                        Endereço de cobrança
                      </Typography>
                      <Box display="flex" gridGap={12}>
                        <TextField
                          label="CEP"
                          margin="dense"
                          style={{ flex: 1 }}
                          value={values.billingPostalCode || values.zipcode || ""}
                          onChange={(e) => setFieldValue("billingPostalCode", e.target.value)}
                        />
                        <TextField
                          label="Número"
                          margin="dense"
                          style={{ flex: 1 }}
                          value={values.billingAddressNumber || ""}
                          onChange={(e) => setFieldValue("billingAddressNumber", e.target.value)}
                        />
                      </Box>
                      <TextField
                        label="Complemento"
                        fullWidth
                        margin="dense"
                        value={values.billingAddressComplement || ""}
                        onChange={(e) => setFieldValue("billingAddressComplement", e.target.value)}
                      />
                      <TextField
                        label="Nome do pagador"
                        fullWidth
                        margin="dense"
                        value={values.billingName || values.firstName || ""}
                        onChange={(e) => setFieldValue("billingName", e.target.value)}
                      />
                      <TextField
                        label="E-mail do pagador"
                        fullWidth
                        margin="dense"
                        value={values.billingEmail || user?.company?.email || ""}
                        onChange={(e) => setFieldValue("billingEmail", e.target.value)}
                      />
                      <TextField
                        label="Celular do pagador (DDD + número)"
                        fullWidth
                        margin="dense"
                        value={values.billingPhone || user?.company?.phone || ""}
                        onChange={(e) => setFieldValue("billingPhone", e.target.value)}
                      />
                    </Box>
                  </Box>
                )}

                <div className={classes.buttons}>
                  {activeStep !== 1 && (
                    <Button onClick={_handleBack} className={classes.button}>
                      {i18n.t("checkoutPage.BACK")}
                    </Button>
                  )}
                  <div className={classes.wrapper}>
                    {activeStep !== 1 && (
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        {isLastStep ? i18n.t("checkoutPage.PAY") : i18n.t("checkoutPage.NEXT")}
                      </Button>
                    )}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </React.Fragment>
    </React.Fragment>
  );
}
