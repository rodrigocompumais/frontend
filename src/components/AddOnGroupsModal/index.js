import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
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
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
    content: { minWidth: 480 },
    tabPanel: { paddingTop: theme.spacing(2) },
    tableWrap: { overflowX: "auto" },
    assignmentRow: { marginBottom: theme.spacing(1) },
}));

const emptyForm = () => ({ name: "", subgroups: [{ name: "", order: 0, items: [{ label: "", value: 0, order: 0 }] }], items: [{ label: "", value: 0, order: 0 }] });

const AddOnGroupsModal = ({ open, onClose }) => {
    const classes = useStyles();
    const [tab, setTab] = useState(0);
    const [groups, setGroups] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [availableGrupos, setAvailableGrupos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(emptyForm());
    const [saving, setSaving] = useState(false);

    const loadGroups = () => api.get("/addon-groups").then(({ data }) => setGroups(Array.isArray(data) ? data : [])).catch(toastError);
    const loadAssignments = () => {
        api.get("/addon-groups/grupo-assignments")
            .then(({ data }) => {
                const grupos = data.availableGrupos || [];
                const list = data.assignments || [];
                setAvailableGrupos(grupos);
                setAssignments(grupos.map((g) => ({ grupo: g, addOnGroupId: list.find((a) => a.grupo === g)?.addOnGroupId ?? null })));
            })
            .catch(toastError);
    };

    useEffect(() => {
        if (open) {
            loadGroups();
            loadAssignments();
        }
    }, [open]);

    useEffect(() => {
        if (formOpen && editId) {
            api.get(`/addon-groups/${editId}`).then(({ data }) => {
                const subgroups = (data.subgroups || []).map((sg, i) => ({
                    name: sg.name || "",
                    order: sg.order ?? i,
                    items: (sg.items || []).map((it, j) => ({ label: it.label || "", value: Number(it.value) || 0, order: it.order ?? j })),
                }));
                const items = (data.items || []).filter((it) => !it.addOnSubgroupId).map((it, j) => ({ label: it.label || "", value: Number(it.value) || 0, order: it.order ?? j }));
                setFormData({ name: data.name || "", subgroups: subgroups.length ? subgroups : [{ name: "", order: 0, items: [{ label: "", value: 0, order: 0 }] }], items: items.length ? items : [{ label: "", value: 0, order: 0 }] });
            }).catch(toastError);
        } else if (formOpen && !editId) {
            setFormData(emptyForm());
        }
    }, [formOpen, editId]);

    const handleCloseForm = () => { setFormOpen(false); setEditId(null); setFormData(emptyForm()); };

    const handleSaveGroup = async () => {
        if (!formData.name.trim()) { toast.error("Nome do grupo é obrigatório"); return; }
        const subgroups = formData.subgroups.filter((sg) => sg.name.trim()).map((sg, i) => ({
            name: sg.name.trim(),
            order: i,
            items: (sg.items || []).filter((it) => it.label && String(it.label).trim()).map((it, j) => ({ label: String(it.label).trim(), value: Number(it.value) || 0, order: j })),
        })).filter((sg) => sg.items.length > 0);
        const items = (formData.items || []).filter((it) => it.label && String(it.label).trim()).map((it, j) => ({ label: String(it.label).trim(), value: Number(it.value) || 0, order: j }));
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/addon-groups/${editId}`, { name: formData.name.trim(), subgroups, items });
                toast.success("Grupo atualizado");
            } else {
                await api.post("/addon-groups", { name: formData.name.trim(), subgroups, items });
                toast.success("Grupo criado");
            }
            loadGroups();
            loadAssignments();
            handleCloseForm();
        } catch (err) {
            toastError(err);
        } finally {
            setSaving(false);
        }
    };

    const addSubgroup = () => setFormData((d) => ({ ...d, subgroups: [...d.subgroups, { name: "", order: d.subgroups.length, items: [{ label: "", value: 0, order: 0 }] }] }));
    const addRootItem = () => setFormData((d) => ({ ...d, items: [...d.items, { label: "", value: 0, order: d.items.length }] }));
    const addItemToSubgroup = (sgIdx) => setFormData((d) => {
        const subs = [...d.subgroups];
        subs[sgIdx] = { ...subs[sgIdx], items: [...(subs[sgIdx].items || []), { label: "", value: 0, order: subs[sgIdx].items.length }] };
        return { ...d, subgroups: subs };
    });
    const updateSubgroup = (sgIdx, field, value) => setFormData((d) => {
        const subs = [...d.subgroups];
        subs[sgIdx] = { ...subs[sgIdx], [field]: value };
        return { ...d, subgroups: subs };
    });
    const updateSubgroupItem = (sgIdx, itIdx, field, value) => setFormData((d) => {
        const subs = [...d.subgroups];
        subs[sgIdx].items = [...(subs[sgIdx].items || [])];
        subs[sgIdx].items[itIdx] = { ...subs[sgIdx].items[itIdx], [field]: value };
        return { ...d, subgroups: subs };
    });
    const updateRootItem = (itIdx, field, value) => setFormData((d) => {
        const items = [...d.items];
        items[itIdx] = { ...items[itIdx], [field]: value };
        return { ...d, items };
    });
    const removeSubgroup = (sgIdx) => setFormData((d) => ({ ...d, subgroups: d.subgroups.filter((_, i) => i !== sgIdx) }));
    const removeSubgroupItem = (sgIdx, itIdx) => setFormData((d) => {
        const subs = [...d.subgroups];
        subs[sgIdx].items = subs[sgIdx].items.filter((_, i) => i !== itIdx);
        return { ...d, subgroups: subs };
    });
    const removeRootItem = (itIdx) => setFormData((d) => ({ ...d, items: d.items.filter((_, i) => i !== itIdx) }));

    const handleDelete = (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/addon-groups/${deleteId}`);
            toast.success("Grupo de adicionais removido");
            loadGroups();
            loadAssignments();
        } catch (err) {
            toastError(err);
        } finally {
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleGrupoAssignmentChange = (grupo, addOnGroupId) => {
        setAssignments((prev) => prev.map((a) => (a.grupo === grupo ? { ...a, addOnGroupId: addOnGroupId || null } : a)));
    };

    const handleSaveAssignments = async () => {
        try {
            await api.put("/addon-groups/grupo-assignments", { assignments });
            toast.success("Atribuições salvas");
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={classes.content}>
                <DialogTitle>Grupos de adicionais</DialogTitle>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Lista de grupos" />
                    <Tab label="Atribuir ao grupo (categoria)" />
                </Tabs>
                <DialogContent>
                    {tab === 0 && (
                        <div className={classes.tabPanel}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Crie grupos de adicionais (ex.: "Açúcar/Leite") e atribua a produtos ou categorias. No cardápio, o cliente poderá marcar adicionais com valor.
                            </Typography>
                            <Box mt={2}>
                                <Button
                                    startIcon={<AddIcon />}
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setFormOpen(true)}
                                >
                                    Criar grupo de adicionais
                                </Button>
                            </Box>
                            <div className={classes.tableWrap}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nome</TableCell>
                                            <TableCell align="right">Ações</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groups.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    Nenhum grupo. Crie um na página Grupos de adicionais.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {groups.map((g) => (
                                            <TableRow key={g.id}>
                                                <TableCell>{g.name}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => { setEditId(g.id); setFormOpen(true); }} title="Editar">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(g.id)} title="Excluir">
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    {tab === 1 && (
                        <div className={classes.tabPanel}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Para cada categoria (grupo) de produto, escolha um grupo de adicionais. Os produtos dessa categoria usarão esses adicionais no cardápio, exceto se o produto tiver um grupo de adicionais próprio.
                            </Typography>
                            <Box mt={2}>
                                {availableGrupos.length === 0 && (
                                    <Typography color="textSecondary">Nenhuma categoria de produto encontrada. Cadastre produtos com "Grupo" preenchido.</Typography>
                                )}
                                {availableGrupos.map((grupo) => (
                                    <div key={grupo} className={classes.assignmentRow}>
                                        <FormControl size="small" variant="outlined" fullWidth>
                                            <InputLabel>{grupo}</InputLabel>
                                            <Select
                                                value={assignments.find((a) => a.grupo === grupo)?.addOnGroupId ?? ""}
                                                onChange={(e) => handleGrupoAssignmentChange(grupo, e.target.value || null)}
                                                label={grupo}
                                            >
                                                <MenuItem value=""><em>Nenhum</em></MenuItem>
                                                {groups.map((g) => (
                                                    <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                ))}
                                {availableGrupos.length > 0 && (
                                    <Button variant="contained" color="primary" onClick={handleSaveAssignments} style={{ marginTop: 16 }}>
                                        Salvar atribuições
                                    </Button>
                                )}
                            </Box>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Editar grupo de adicionais" : "Novo grupo de adicionais"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome do grupo"
                        value={formData.name}
                        onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                    />
                    <Typography variant="subtitle2" style={{ marginTop: 16 }}>Subgrupos (ex.: Açúcar, Leite)</Typography>
                    {formData.subgroups.map((sg, sgIdx) => (
                        <Box key={sgIdx} mt={1} p={1} border={1} borderColor="divider" borderRadius={4}>
                            <TextField size="small" label="Nome do subgrupo" value={sg.name} onChange={(e) => updateSubgroup(sgIdx, "name", e.target.value)} fullWidth style={{ marginBottom: 8 }} />
                            {(sg.items || []).map((it, itIdx) => (
                                <div key={itIdx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                    <TextField size="small" label="Item" value={it.label} onChange={(e) => updateSubgroupItem(sgIdx, itIdx, "label", e.target.value)} style={{ flex: 2 }} />
                                    <TextField size="small" type="number" label="R$" value={it.value} onChange={(e) => updateSubgroupItem(sgIdx, itIdx, "value", e.target.value)} inputProps={{ min: 0, step: 0.01 }} style={{ width: 80 }} />
                                    <IconButton size="small" onClick={() => removeSubgroupItem(sgIdx, itIdx)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                </div>
                            ))}
                            <Button size="small" startIcon={<AddIcon />} onClick={() => addItemToSubgroup(sgIdx)}>Adicionar item</Button>
                            <Button size="small" onClick={() => removeSubgroup(sgIdx)} style={{ marginLeft: 8 }}>Remover subgrupo</Button>
                        </Box>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={addSubgroup} style={{ marginTop: 8 }}>Adicionar subgrupo</Button>
                    <Typography variant="subtitle2" style={{ marginTop: 16 }}>Itens sem subgrupo</Typography>
                    {formData.items.map((it, itIdx) => (
                        <div key={itIdx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                            <TextField size="small" label="Item" value={it.label} onChange={(e) => updateRootItem(itIdx, "label", e.target.value)} style={{ flex: 2 }} />
                            <TextField size="small" type="number" label="R$" value={it.value} onChange={(e) => updateRootItem(itIdx, "value", e.target.value)} inputProps={{ min: 0, step: 0.01 }} style={{ width: 80 }} />
                            <IconButton size="small" onClick={() => removeRootItem(itIdx)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                        </div>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={addRootItem}>Adicionar item</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForm}>Cancelar</Button>
                    <Button onClick={handleSaveGroup} color="primary" variant="contained" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                </DialogActions>
            </Dialog>
            <ConfirmationModal
                title="Excluir grupo de adicionais?"
                open={confirmOpen}
                onClose={() => { setConfirmOpen(false); setDeleteId(null); }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default AddOnGroupsModal;
