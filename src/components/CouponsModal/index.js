import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
import IconButton from "@material-ui/core/IconButton";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../ConfirmationModal";

const emptyForm = () => ({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    expiresAt: "",
    usageLimit: "",
    active: true,
});

const formatMoney = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

const CouponsModal = ({ open, onClose }) => {
    const [coupons, setCoupons] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const loadCoupons = () =>
        api.get("/coupons").then(({ data }) => setCoupons(Array.isArray(data) ? data : [])).catch(toastError);

    useEffect(() => {
        if (open) loadCoupons();
    }, [open]);

    const handleOpenForm = (coupon = null) => {
        if (coupon) {
            setEditId(coupon.id);
            setFormData({
                code: coupon.code || "",
                discountType: coupon.discountType || "percent",
                discountValue: coupon.discountValue != null ? Number(coupon.discountValue) : "",
                minOrderValue: coupon.minOrderValue != null ? Number(coupon.minOrderValue) : "",
                expiresAt: coupon.expiresAt ? String(coupon.expiresAt).slice(0, 10) : "",
                usageLimit: coupon.usageLimit != null ? coupon.usageLimit : "",
                active: coupon.active !== false,
            });
        } else {
            setEditId(null);
            setFormData(emptyForm());
        }
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditId(null);
        setFormData(emptyForm());
    };

    const handleSave = async () => {
        const code = String(formData.code || "").trim().toUpperCase();
        const discountValue = parseFloat(formData.discountValue);
        if (!code) { toast.error("Informe o código do cupom"); return; }
        if (!(discountValue > 0)) { toast.error("Informe o valor do desconto"); return; }
        if (formData.discountType === "percent" && discountValue > 100) {
            toast.error("Desconto percentual não pode passar de 100%");
            return;
        }
        const payload = {
            code,
            discountType: formData.discountType,
            discountValue,
            minOrderValue: formData.minOrderValue === "" ? null : parseFloat(formData.minOrderValue) || 0,
            expiresAt: formData.expiresAt ? `${formData.expiresAt}T23:59:59` : null,
            usageLimit: formData.usageLimit === "" ? null : parseInt(formData.usageLimit, 10) || null,
            active: formData.active === true,
        };
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/coupons/${editId}`, payload);
                toast.success("Cupom atualizado");
            } else {
                await api.post("/coupons", payload);
                toast.success("Cupom criado");
            }
            loadCoupons();
            handleCloseForm();
        } catch (err) {
            toastError(err);
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/coupons/${deleteId}`);
            toast.success("Cupom removido");
            loadCoupons();
        } catch (err) {
            toastError(err);
        } finally {
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const describeDiscount = (c) =>
        c.discountType === "percent"
            ? `${Number(c.discountValue)}%`
            : formatMoney(c.discountValue);

    const isExpired = (c) => c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
    const isExhausted = (c) => c.usageLimit != null && c.usageCount >= c.usageLimit;

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Cupons de desconto</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Crie cupons para o cardápio público. O cliente digita o código no checkout e o desconto é aplicado no total.
                    </Typography>
                    <Box mt={2} mb={2}>
                        <Button startIcon={<AddIcon />} variant="outlined" color="primary" onClick={() => handleOpenForm()}>
                            Criar cupom
                        </Button>
                    </Box>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Código</TableCell>
                                <TableCell>Desconto</TableCell>
                                <TableCell>Mínimo</TableCell>
                                <TableCell>Validade</TableCell>
                                <TableCell>Usos</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coupons.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">Nenhum cupom criado.</TableCell>
                                </TableRow>
                            )}
                            {coupons.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell><strong>{c.code}</strong></TableCell>
                                    <TableCell>{describeDiscount(c)}</TableCell>
                                    <TableCell>{c.minOrderValue != null && Number(c.minOrderValue) > 0 ? formatMoney(c.minOrderValue) : "—"}</TableCell>
                                    <TableCell>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "Sem validade"}</TableCell>
                                    <TableCell>{c.usageCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}</TableCell>
                                    <TableCell>
                                        {c.active === false ? (
                                            <Chip size="small" label="Inativo" />
                                        ) : isExpired(c) ? (
                                            <Chip size="small" label="Expirado" style={{ backgroundColor: "#ffebee", color: "#c62828" }} />
                                        ) : isExhausted(c) ? (
                                            <Chip size="small" label="Esgotado" style={{ backgroundColor: "#fff3e0", color: "#e65100" }} />
                                        ) : (
                                            <Chip size="small" label="Ativo" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }} />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenForm(c)} title="Editar">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => { setDeleteId(c.id); setConfirmOpen(true); }} title="Excluir">
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">Fechar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="xs" fullWidth>
                <DialogTitle>{editId ? "Editar cupom" : "Novo cupom"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Código"
                        value={formData.code}
                        onChange={(e) => setFormData((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        inputProps={{ maxLength: 30, style: { textTransform: "uppercase" } }}
                        placeholder="Ex.: BEMVINDO10"
                    />
                    <Box display="flex" style={{ gap: 8 }} mt={1}>
                        <FormControl variant="outlined" margin="dense" style={{ minWidth: 140 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={formData.discountType}
                                onChange={(e) => setFormData((d) => ({ ...d, discountType: e.target.value }))}
                                label="Tipo"
                            >
                                <MenuItem value="percent">Percentual (%)</MenuItem>
                                <MenuItem value="fixed">Valor fixo (R$)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label={formData.discountType === "percent" ? "Desconto (%)" : "Desconto (R$)"}
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => setFormData((d) => ({ ...d, discountValue: e.target.value }))}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Box>
                    <TextField
                        label="Pedido mínimo (R$) — opcional"
                        type="number"
                        value={formData.minOrderValue}
                        onChange={(e) => setFormData((d) => ({ ...d, minOrderValue: e.target.value }))}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                    <TextField
                        label="Validade — opcional"
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData((d) => ({ ...d, expiresAt: e.target.value }))}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Limite de usos — opcional"
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData((d) => ({ ...d, usageLimit: e.target.value }))}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        inputProps={{ min: 1, step: 1 }}
                    />
                    <FormControlLabel
                        control={(
                            <Switch
                                checked={formData.active === true}
                                onChange={(e) => setFormData((d) => ({ ...d, active: e.target.checked }))}
                                color="primary"
                            />
                        )}
                        label="Ativo"
                        style={{ marginTop: 8 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm}>Cancelar</Button>
                    <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationModal
                title="Excluir cupom?"
                open={confirmOpen}
                onClose={() => { setConfirmOpen(false); setDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default CouponsModal;
