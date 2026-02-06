import React, {
    useState,
    useEffect,
    useCallback,
    useContext,
} from "react";
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
import Chip from "@material-ui/core/Chip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import CategoryIcon from "@material-ui/icons/Category";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ProductModal from "../../components/ProductModal";
import ProductGroupsModal from "../../components/ProductGroupsModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanyModules from "../../hooks/useCompanyModules";

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    searchWrapper: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
    menuChip: {
        fontWeight: 600,
    },
    actionButtons: {
        display: "flex",
        gap: theme.spacing(0.5),
    },
    productImage: {
        width: 40,
        height: 40,
        objectFit: "cover",
        borderRadius: 4,
    },
    productImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: theme.palette.action.hover,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.text.disabled,
        fontSize: "0.75rem",
    },
}));

const Products = () => {
    const classes = useStyles();
    const history = useHistory();
    const { user } = useContext(AuthContext);
    const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [groupsModalOpen, setGroupsModalOpen] = useState(false);
    const [filterMenuOnly, setFilterMenuOnly] = useState(false);
    const [failedImages, setFailedImages] = useState(new Set());

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                searchParam: searchParam || undefined,
                pageNumber,
                isMenuProduct: filterMenuOnly ? true : undefined,
            };
            const { data } = await api.get("/products", { params });
            if (pageNumber === 1) {
                setProducts(data.products || []);
            } else {
                setProducts((prev) => [...prev, ...(data.products || [])]);
            }
            setHasMore(data.hasMore || false);
            setLoading(false);
        } catch (err) {
            toastError(err);
            setLoading(false);
        }
    }, [searchParam, pageNumber, filterMenuOnly]);

    const socketManager = useContext(SocketContext);

    useEffect(() => {
        setPageNumber(1);
        setProducts([]);
    }, [searchParam, filterMenuOnly]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, filterMenuOnly, fetchProducts]);

    useEffect(() => {
        const socket = socketManager.getSocket(user.companyId);

        socket.on(`company-${user.companyId}-product`, (data) => {
            if (data.action === "update" || data.action === "create") {
                const product = data.product;
                setProducts((prev) => {
                    const index = prev.findIndex((p) => p.id === product.id);
                    if (index !== -1) {
                        const updated = [...prev];
                        updated[index] = product;
                        return updated;
                    } else {
                        return [product, ...prev];
                    }
                });
            }

            if (data.action === "delete") {
                setProducts((prev) => prev.filter((p) => p.id !== data.productId));
            }
        });

        return () => {
            socket.off(`company-${user.companyId}-product`);
        };
    }, [socketManager, user]);

    const handleOpenProductModal = () => {
        setSelectedProduct(null);
        setProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setSelectedProduct(null);
        setProductModalOpen(false);
        fetchProducts();
    };

    const handleOpenGroupsModal = () => {
        setGroupsModalOpen(true);
    };

    const handleCloseGroupsModal = () => {
        setGroupsModalOpen(false);
        fetchProducts(); // Atualizar lista de produtos após mudanças nos grupos
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await api.delete(`/products/${productId}`);
            toast.success("Produto deletado com sucesso");
        } catch (err) {
            toastError(err);
        }
        setDeletingProduct(null);
        setConfirmModalOpen(false);
        fetchProducts();
    };

    const loadMore = () => {
        if (!hasMore || loading) return;
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    if (modulesLoading) {
        return (
            <MainContainer>
                <Paper style={{ padding: 32, textAlign: "center", margin: 24 }}>
                    Carregando...
                </Paper>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            {!hasLanchonetes && (
                <Paper style={{ padding: 32, textAlign: "center", margin: 24 }}>
                    <Title>Módulo Lanchonetes</Title>
                    <p style={{ color: "gray", marginBottom: 24 }}>
                        O Módulo Lanchonetes é necessário para gerenciar produtos e cardápio. 
                        Contrate o módulo para usar esta funcionalidade.
                    </p>
                    <Button variant="contained" color="primary" onClick={() => history.push("/forms")}>
                        Voltar para Formulários
                    </Button>
                </Paper>
            )}
            {hasLanchonetes && (
            <>
            <ConfirmationModal
                title="Confirmar exclusão"
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => handleDeleteProduct(deletingProduct?.id)}
            >
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </ConfirmationModal>
            <ProductModal
                open={productModalOpen}
                onClose={handleCloseProductModal}
                productId={selectedProduct?.id}
            />
            <ProductGroupsModal
                open={groupsModalOpen}
                onClose={handleCloseGroupsModal}
                onGroupChange={fetchProducts}
            />
            <MainHeader>
                <Title>Produtos ({products.length})</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder="Buscar produtos..."
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        size="small"
                        style={{ marginRight: 8 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={filterMenuOnly}
                                onChange={(e) => setFilterMenuOnly(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Apenas cardápio"
                        style={{ marginRight: 8 }}
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<CategoryIcon />}
                        onClick={handleOpenGroupsModal}
                        style={{ marginRight: 8 }}
                    >
                        Grupos
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenProductModal}
                    >
                        Novo Produto
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">Imagem</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Grupo</TableCell>
                            <TableCell align="right">Valor</TableCell>
                            <TableCell align="center">Quantidade</TableCell>
                            <TableCell align="center">Cardápio</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Nenhum produto encontrado
                                </TableCell>
                            </TableRow>
                        )}
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell padding="checkbox">
                                    {product.imageUrl && !failedImages.has(product.id) ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className={classes.productImage}
                                            onError={() => setFailedImages((prev) => new Set(prev).add(product.id))}
                                        />
                                    ) : (
                                        <div className={classes.productImagePlaceholder}>—</div>
                                    )}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>
                                    {product.description || "-"}
                                </TableCell>
                                <TableCell>
                                    {product.grupo || "-"}
                                </TableCell>
                                <TableCell align="right">
                                    {formatCurrency(product.value)}
                                </TableCell>
                                <TableCell align="center">
                                    {product.quantity}
                                </TableCell>
                                <TableCell align="center">
                                    {product.isMenuProduct ? (
                                        <Chip
                                            label="Sim"
                                            color="primary"
                                            size="small"
                                            className={classes.menuChip}
                                        />
                                    ) : (
                                        <Chip
                                            label="Não"
                                            size="small"
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <div className={classes.actionButtons}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditProduct(product)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setConfirmModalOpen(true);
                                                setDeletingProduct(product);
                                            }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {loading && <TableRowSkeleton columns={8} />}
                    </TableBody>
                </Table>
            </Paper>
            </>
            )}
        </MainContainer>
    );
};

export default Products;
