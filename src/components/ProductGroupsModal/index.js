import React, { useState, useEffect, useContext } from "react";
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
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    dialogContent: {
        padding: theme.spacing(2),
    },
    tableContainer: {
        maxHeight: 400,
        overflowY: "auto",
        marginTop: theme.spacing(2),
    },
    emptyState: {
        textAlign: "center",
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
    },
    addGroupSection: {
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[50],
        borderRadius: theme.shape.borderRadius,
    },
    addGroupForm: {
        display: "flex",
        gap: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
}));

const ProductGroupsModal = ({ open, onClose, onGroupChange }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [deletingGroup, setDeletingGroup] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchGroups();
        }
    }, [open]);

    const getStoredGroups = () => {
        try {
            const stored = localStorage.getItem(`productGroups_${user?.companyId}`);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const saveStoredGroups = (groupsList) => {
        try {
            localStorage.setItem(`productGroups_${user?.companyId}`, JSON.stringify(groupsList));
        } catch (err) {
            console.error("Erro ao salvar grupos:", err);
        }
    };

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const groupsMap = {};
            let pageNumber = 1;
            let hasMore = true;

            // Buscar todas as páginas de produtos para obter todos os grupos
            while (hasMore) {
                const { data } = await api.get("/products", {
                    params: { pageNumber },
                });

                // Extrair grupos únicos dos produtos
                (data.products || []).forEach((product) => {
                    if (product.grupo && product.grupo.trim() !== "") {
                        const grupo = product.grupo.trim();
                        if (!groupsMap[grupo]) {
                            groupsMap[grupo] = 0;
                        }
                        groupsMap[grupo]++;
                    }
                });

                hasMore = data.hasMore || false;
                pageNumber++;
            }

            // Adicionar grupos salvos no localStorage que ainda não têm produtos
            const storedGroups = getStoredGroups();
            storedGroups.forEach((groupName) => {
                if (!groupsMap[groupName]) {
                    groupsMap[groupName] = 0;
                }
            });

            // Converter para array e ordenar
            const groupsArray = Object.entries(groupsMap)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setGroups(groupsArray);
        } catch (err) {
            toastError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = () => {
        if (!newGroupName || newGroupName.trim() === "") {
            toast.error("Digite um nome para o grupo");
            return;
        }

        const groupName = newGroupName.trim();

        // Verificar se o grupo já existe
        if (groups.some((g) => g.name.toLowerCase() === groupName.toLowerCase())) {
            toast.error("Este grupo já existe");
            return;
        }

        // Adicionar à lista local (com contagem 0)
        const newGroup = { name: groupName, count: 0 };
        const updatedGroups = [...groups, newGroup].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        setGroups(updatedGroups);
        
        // Salvar no localStorage
        const storedGroups = getStoredGroups();
        if (!storedGroups.includes(groupName)) {
            storedGroups.push(groupName);
            saveStoredGroups(storedGroups);
        }
        
        setNewGroupName("");
        toast.success("Grupo criado! Associe este grupo a um produto para utilizá-lo.");
        
        if (onGroupChange) {
            onGroupChange();
        }
    };

    const handleDeleteGroup = async () => {
        if (!deletingGroup) return;

        try {
            // Se o grupo não tem produtos associados, apenas remover da lista e do localStorage
            if (deletingGroup.count === 0) {
                setGroups(groups.filter((g) => g.name !== deletingGroup.name));
                
                // Remover do localStorage
                const storedGroups = getStoredGroups();
                const updatedStored = storedGroups.filter(g => g !== deletingGroup.name);
                saveStoredGroups(updatedStored);
                
                toast.success("Grupo removido");
                setDeletingGroup(null);
                setConfirmModalOpen(false);
                
                if (onGroupChange) {
                    onGroupChange();
                }
                return;
            }

            // Buscar todos os produtos com este grupo (todas as páginas)
            const productsWithGroup = [];
            let pageNumber = 1;
            let hasMore = true;

            while (hasMore) {
                const { data } = await api.get("/products", {
                    params: { pageNumber },
                });

                const filtered = (data.products || []).filter(
                    (p) => p.grupo && p.grupo.trim() === deletingGroup.name
                );
                productsWithGroup.push(...filtered);

                hasMore = data.hasMore || false;
                pageNumber++;
            }

            // Remover o grupo de todos os produtos
            if (productsWithGroup.length > 0) {
                const updatePromises = productsWithGroup.map((product) =>
                    api.put(`/products/${product.id}`, {
                        grupo: null,
                    })
                );

                await Promise.all(updatePromises);
            }

            // Atualizar lista local
            setGroups(groups.filter((g) => g.name !== deletingGroup.name));
            toast.success(
                `Grupo removido de ${productsWithGroup.length} produto(s)`
            );
            setDeletingGroup(null);
            setConfirmModalOpen(false);

            if (onGroupChange) {
                onGroupChange();
            }
        } catch (err) {
            toastError(err);
        }
    };

    const handleClose = () => {
        setNewGroupName("");
        setDeletingGroup(null);
        onClose();
    };

    return (
        <>
            <ConfirmationModal
                title="Remover grupo"
                open={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setDeletingGroup(null);
                }}
                onConfirm={handleDeleteGroup}
            >
                Tem certeza que deseja remover o grupo "{deletingGroup?.name}"? 
                Esta ação removerá o grupo de todos os produtos que o utilizam.
            </ConfirmationModal>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
                    Gerenciar Grupos de Produtos
                </DialogTitle>
                <DialogContent dividers className={classes.dialogContent}>
                    <Box className={classes.addGroupSection}>
                        <Typography variant="subtitle2" gutterBottom>
                            Criar Novo Grupo
                        </Typography>
                        <Box className={classes.addGroupForm}>
                            <TextField
                                label="Nome do Grupo"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                variant="outlined"
                                size="small"
                                fullWidth
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddGroup();
                                    }
                                }}
                                placeholder="Ex: Bebidas, Comidas, etc."
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddGroup}
                            >
                                Criar
                            </Button>
                        </Box>
                    </Box>

                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Grupos existentes (associe grupos aos produtos no cadastro de produtos):
                    </Typography>

                    <Paper className={classes.tableContainer} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome do Grupo</TableCell>
                                    <TableCell align="center">Produtos</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groups.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={3} className={classes.emptyState}>
                                            Nenhum grupo cadastrado
                                        </TableCell>
                                    </TableRow>
                                )}
                                {groups.map((group) => (
                                    <TableRow key={group.name}>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell align="center">
                                            {group.count}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setDeletingGroup(group);
                                                    setConfirmModalOpen(true);
                                                }}
                                                title="Remover grupo de todos os produtos"
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="outlined">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProductGroupsModal;
