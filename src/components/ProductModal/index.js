import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
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
    imagePreview: {
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: 8,
        marginTop: theme.spacing(1),
    },
}));

const ProductSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Nome muito curto")
        .required("Nome é obrigatório"),
    description: Yup.string().nullable(),
    imageUrl: Yup.string().nullable(),
    value: Yup.number()
        .required("Valor é obrigatório")
        .min(0, "Valor deve ser maior ou igual a zero"),
    quantity: Yup.number()
        .integer("Quantidade deve ser um número inteiro")
        .min(0, "Quantidade deve ser maior ou igual a zero")
        .nullable(),
    isMenuProduct: Yup.boolean().nullable(),
    grupo: Yup.string().nullable(),
});

const ProductModal = ({ open, onClose, productId }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);

    const initialState = {
        name: "",
        description: "",
        value: 0,
        quantity: 0,
        isMenuProduct: false,
        grupo: "",
        imageUrl: "",
    };

    const [product, setProduct] = useState(initialState);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const imageInputRef = React.useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setProduct(initialState);
                return;
            }

            try {
                const { data } = await api.get(`/products/${productId}`);
                setProduct({
                    name: data.name || "",
                    description: data.description || "",
                    value: data.value || 0,
                    quantity: data.quantity || 0,
                    isMenuProduct: data.isMenuProduct || false,
                    grupo: data.grupo || "",
                    imageUrl: data.imageUrl || "",
                });
            } catch (err) {
                toastError(err);
            }
        };

        if (open) {
            fetchProduct();
            fetchGroups();
        }
    }, [productId, open]);

    const getStoredGroups = () => {
        try {
            const companyId = user?.companyId;
            if (!companyId) return [];
            const stored = localStorage.getItem(`productGroups_${companyId}`);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const fetchGroups = async () => {
        setLoadingGroups(true);
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
                            groupsMap[grupo] = true;
                        }
                    }
                });

                hasMore = data.hasMore || false;
                pageNumber++;
            }

            // Adicionar grupos salvos no localStorage
            const storedGroups = getStoredGroups();
            storedGroups.forEach((groupName) => {
                if (!groupsMap[groupName]) {
                    groupsMap[groupName] = true;
                }
            });

            // Converter para array e ordenar
            const groupsArray = Object.keys(groupsMap).sort((a, b) => 
                a.localeCompare(b)
            );

            setAvailableGroups(groupsArray);
        } catch (err) {
            toastError(err);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleClose = () => {
        setProduct(initialState);
        setAvailableGroups([]);
        onClose();
    };

    const handleImageUpload = async (e, setFieldValue) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            toast.error("Imagem deve ter no máximo 50MB");
            return;
        }
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const { data } = await api.post("/products/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const url = data.imageUrl || "";
            setProduct((prev) => ({ ...prev, imageUrl: url }));
            if (setFieldValue) setFieldValue("imageUrl", url);
            toast.success("Imagem enviada com sucesso");
        } catch (err) {
            toastError(err);
        } finally {
            setUploadingImage(false);
            e.target.value = "";
        }
    };

    const handleSaveProduct = async (values) => {
        try {
            if (productId) {
                await api.put(`/products/${productId}`, values);
                toast.success("Produto atualizado com sucesso");
            } else {
                await api.post("/products", values);
                toast.success("Produto criado com sucesso");
            }
            // Atualizar lista de grupos caso um novo grupo tenha sido criado
            if (values.grupo && values.grupo.trim() !== "") {
                const grupo = values.grupo.trim();
                if (!availableGroups.includes(grupo)) {
                    setAvailableGroups([...availableGroups, grupo].sort((a, b) => 
                        a.localeCompare(b)
                    ));
                }
            }
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
                    {productId ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <Formik
                    initialValues={product}
                    enableReinitialize={true}
                    validationSchema={ProductSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveProduct(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <DialogContent dividers>
                                <Field
                                    as={TextField}
                                    label="Nome do Produto"
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    required
                                    autoFocus
                                />
                                <br />
                                <br />
                                <Field
                                    as={TextField}
                                    label="Descrição"
                                    name="description"
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                                <br />
                                <br />
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    style={{ display: "none" }}
                                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                                />
                                <Field
                                    as={TextField}
                                    label="Imagem do produto (máx. 50MB)"
                                    name="imageUrl"
                                    placeholder="URL ou clique no ícone para enviar"
                                    error={touched.imageUrl && Boolean(errors.imageUrl)}
                                    helperText={touched.imageUrl && errors.imageUrl}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => {
                                                        if (imageInputRef.current) imageInputRef.current.click();
                                                    }}
                                                    disabled={uploadingImage}
                                                    edge="end"
                                                    title="Enviar imagem"
                                                >
                                                    {uploadingImage ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <CloudUploadIcon />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {values.imageUrl && (
                                    <Box mt={1}>
                                        <img
                                            src={values.imageUrl}
                                            alt="Preview"
                                            className={classes.imagePreview}
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />
                                    </Box>
                                )}
                                <br />
                                <br />
                                <FormControl
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    error={touched.grupo && Boolean(errors.grupo)}
                                >
                                    <InputLabel id="grupo-select-label">Grupo</InputLabel>
                                    <Field
                                        as={Select}
                                        labelId="grupo-select-label"
                                        id="grupo-select"
                                        name="grupo"
                                        label="Grupo"
                                        value={values.grupo || ""}
                                    >
                                        <MenuItem value="">
                                            <em>Nenhum</em>
                                        </MenuItem>
                                        {loadingGroups ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} />
                                            </MenuItem>
                                        ) : (
                                            availableGroups.map((group) => (
                                                <MenuItem key={group} value={group}>
                                                    {group}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Field>
                                    {touched.grupo && errors.grupo && (
                                        <span style={{ color: "#f44336", fontSize: "0.75rem", marginTop: "3px", marginLeft: "14px" }}>
                                            {errors.grupo}
                                        </span>
                                    )}
                                </FormControl>
                                <br />
                                <br />
                                <div className={classes.multFieldLine}>
                                    <Field
                                        as={TextField}
                                        label="Valor"
                                        name="value"
                                        type="number"
                                        inputProps={{ step: "0.01", min: "0" }}
                                        error={touched.value && Boolean(errors.value)}
                                        helperText={touched.value && errors.value}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        required
                                        InputProps={{
                                            startAdornment: "R$ ",
                                        }}
                                    />
                                    <Field
                                        as={TextField}
                                        label="Quantidade"
                                        name="quantity"
                                        type="number"
                                        inputProps={{ min: "0" }}
                                        error={touched.quantity && Boolean(errors.quantity)}
                                        helperText={touched.quantity && errors.quantity}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </div>
                                <br />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.isMenuProduct || false}
                                            onChange={(e) =>
                                                setFieldValue("isMenuProduct", e.target.checked)
                                            }
                                            color="primary"
                                        />
                                    }
                                    label="Produto de cardápio"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {productId ? "Salvar" : "Criar"}
                                    {isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default ProductModal;
