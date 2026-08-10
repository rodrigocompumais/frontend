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
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Chip from "@material-ui/core/Chip";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

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
        .min(0, "Valor deve ser maior ou igual a zero")
        .nullable(),
    quantity: Yup.number()
        .integer("Quantidade deve ser um número inteiro")
        .min(0, "Quantidade deve ser maior ou igual a zero")
        .nullable(),
    isMenuProduct: Yup.boolean().nullable(),
    variablePrice: Yup.boolean().nullable(),
    isCombo: Yup.boolean().nullable(),
    allowsHalfAndHalf: Yup.boolean().nullable(),
    halfAndHalfPriceRule: Yup.string().oneOf(["max", "fixed", "average"]).nullable(),
    halfAndHalfGrupo: Yup.string().nullable(),
    grupo: Yup.string().nullable(),
    addOnGroupId: Yup.number().nullable(),
    idUniplus: Yup.string().max(20).nullable(),
    variations: Yup.array()
        .of(
            Yup.object().shape({
                name: Yup.string().required("Nome da variação é obrigatório"),
                options: Yup.array()
                    .min(1, "Adicione ao menos uma opção")
                    .of(
                        Yup.object().shape({
                            label: Yup.string().required("Rótulo é obrigatório"),
                            value: Yup.number().min(0, "Valor deve ser ≥ 0").required("Valor é obrigatório"),
                            idUniplus: Yup.string().max(20).nullable(),
                        })
                    )
                    .required(),
            })
        )
        .nullable(),
    comboItems: Yup.array()
        .of(
            Yup.object().shape({
                productId: Yup.number().required(),
                value: Yup.number().min(0).required(),
                quantity: Yup.number().integer().min(1).required(),
                variationOptionId: Yup.number().nullable(),
            })
        )
        .nullable(),
}).test(
    "halfAndHalfRule",
    "Regra de cobrança é obrigatória quando 'Permitir meio a meio' está ativo",
    (obj) => {
        if (obj?.isCombo === true) return true;
        if (obj?.allowsHalfAndHalf === true)
            return obj?.halfAndHalfPriceRule != null && ["max", "fixed", "average"].includes(obj.halfAndHalfPriceRule);
        return true;
    }
).test(
    "comboOrValue",
    "Combo precisa de pelo menos um produto integrante",
    (obj) => {
        if (obj?.isCombo === true) {
            return Array.isArray(obj?.comboItems) && obj.comboItems.length > 0;
        }
        return obj?.value != null && Number(obj.value) >= 0;
    }
);

const ProductModal = ({ open, onClose, productId }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);

    const initialState = {
        name: "",
        description: "",
        value: 0,
        quantity: 0,
        isMenuProduct: false,
        variablePrice: false,
        isCombo: false,
        allowsHalfAndHalf: false,
        halfAndHalfPriceRule: "",
        halfAndHalfGrupo: "",
        grupo: "",
        addOnGroupId: null,
        imageUrl: "",
        idUniplus: "",
        variations: [],
        comboItems: [],
    };

    const [product, setProduct] = useState(initialState);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [addOnGroups, setAddOnGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uniplusEnabled, setUniplusEnabled] = useState(false);
    const [menuProductsForCombo, setMenuProductsForCombo] = useState([]);
    const [comboProductToAdd, setComboProductToAdd] = useState("");
    const imageInputRef = React.useRef(null);

    const calcComboTotal = (items) =>
        (items || []).reduce((sum, it) => sum + (Number(it.value) || 0) * (Number(it.quantity) || 1), 0);

    /** Expande produtos do cardápio em opções selecionáveis (inclui variações/tamanhos). */
    const buildComboSelectableOptions = (products) => {
        const options = [];
        (products || []).forEach((p) => {
            const firstVar = p.variations?.[0];
            const opts = firstVar?.options || [];
            if (opts.length > 0) {
                opts.forEach((opt) => {
                    options.push({
                        key: `${p.id}_${opt.id}`,
                        productId: p.id,
                        variationOptionId: opt.id,
                        productName: `${p.name} - ${opt.label}`,
                        value: Number(opt.value) || 0,
                        grupo: p.grupo,
                    });
                });
            } else {
                options.push({
                    key: String(p.id),
                    productId: p.id,
                    variationOptionId: null,
                    productName: p.name,
                    value: Number(p.value) || 0,
                    grupo: p.grupo,
                });
            }
        });
        return options;
    };
    
    // Adicionar grupos do produto aos grupos disponíveis quando o produto mudar
    useEffect(() => {
        if (product.grupo && product.grupo.trim() !== "") {
            setAvailableGroups((prevGroups) => {
                const grupo = product.grupo.trim();
                if (!prevGroups.includes(grupo)) {
                    const newGroups = [...prevGroups, grupo].sort((a, b) => a.localeCompare(b));
                    return newGroups;
                }
                return prevGroups;
            });
        }
        if (product.halfAndHalfGrupo && product.halfAndHalfGrupo.trim() !== "") {
            setAvailableGroups((prevGroups) => {
                const grupo = product.halfAndHalfGrupo.trim();
                if (!prevGroups.includes(grupo)) {
                    const newGroups = [...prevGroups, grupo].sort((a, b) => a.localeCompare(b));
                    return newGroups;
                }
                return prevGroups;
            });
        }
    }, [product.grupo, product.halfAndHalfGrupo]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setProduct(initialState);
                return;
            }

            try {
                const { data } = await api.get(`/products/${productId}`);
                const variations = (data.variations || []).map((v) => ({
                    name: v.name || "",
                    options: (v.options || []).map((o) => ({
                        label: o.label || "",
                        value: parseFloat(o.value) || 0,
                        idUniplus: o.idUniplus || "",
                    })),
                }));
                
                const productGrupo = (data.grupo || "").trim();
                const productHalfAndHalfGrupo = (data.halfAndHalfGrupo || "").trim();
                
                // Adicionar grupos do produto aos grupos disponíveis ANTES de setProduct
                // para garantir que estejam disponíveis quando o Formik renderizar
                setAvailableGroups((prevGroups) => {
                    const newGroups = [...prevGroups];
                    let updated = false;
                    if (productGrupo && !newGroups.includes(productGrupo)) {
                        newGroups.push(productGrupo);
                        updated = true;
                    }
                    if (productHalfAndHalfGrupo && !newGroups.includes(productHalfAndHalfGrupo)) {
                        newGroups.push(productHalfAndHalfGrupo);
                        updated = true;
                    }
                    if (updated) {
                        newGroups.sort((a, b) => a.localeCompare(b));
                    }
                    return newGroups;
                });
                
                // Aguardar um tick para garantir que availableGroups foi atualizado
                await new Promise(resolve => setTimeout(resolve, 0));
                
                const comboItems = (data.comboItems || [])
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((ci) => {
                        const baseName = ci.product?.name || `Produto #${ci.productId}`;
                        const optLabel = ci.variationOption?.label;
                        return {
                            productId: ci.productId,
                            variationOptionId: ci.variationOptionId || null,
                            productName: optLabel ? `${baseName} - ${optLabel}` : baseName,
                            value: parseFloat(ci.value) || 0,
                            quantity: Number(ci.quantity) || 1,
                        };
                    });

                setProduct({
                    name: data.name || "",
                    description: data.description || "",
                    value: data.value || 0,
                    quantity: data.quantity || 0,
                    isMenuProduct: data.isMenuProduct || false,
                    variablePrice: data.variablePrice || false,
                    isCombo: data.isCombo || false,
                    allowsHalfAndHalf: data.allowsHalfAndHalf || false,
                    halfAndHalfPriceRule: data.halfAndHalfPriceRule || "",
                    halfAndHalfGrupo: productHalfAndHalfGrupo,
                    grupo: productGrupo,
                    addOnGroupId: data.addOnGroupId ?? null,
                    imageUrl: data.imageUrl || "",
                    idUniplus: data.idUniplus || "",
                    variations,
                    comboItems,
                });
            } catch (err) {
                toastError(err);
            }
        };

        const fetchMenuProductsForCombo = async () => {
            try {
                const all = [];
                let page = 1;
                let hasMore = true;
                while (hasMore && page <= 50) {
                    const { data } = await api.get("/products", {
                        params: { isMenuProduct: true, pageNumber: page },
                    });
                    all.push(...(data.products || []));
                    hasMore = Boolean(data.hasMore);
                    page += 1;
                }
                setMenuProductsForCombo(
                    all.filter((p) => !p.isCombo && (!productId || p.id !== productId))
                );
            } catch {
                setMenuProductsForCombo([]);
            }
        };

        if (open) {
            fetchProduct();
            fetchGroups();
            fetchMenuProductsForCombo();
            setComboProductToAdd("");
            api.get("/addon-groups").then(({ data }) => setAddOnGroups(Array.isArray(data) ? data : [])).catch(() => setAddOnGroups([]));
            api.get("/settings").then(({ data }) => {
                const list = Array.isArray(data) ? data : [];
                const row = list.find((s) => s.key === "uniplusEnabled");
                setUniplusEnabled(row?.value === "enabled");
            }).catch(() => setUniplusEnabled(false));
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
            // Atualizar só o campo no Formik; não alterar product para não disparar enableReinitialize e limpar os outros campos
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
            const payload = { ...values };
            if (!payload.allowsHalfAndHalf || payload.halfAndHalfPriceRule === "") {
                payload.halfAndHalfPriceRule = null;
            }
            if (payload.halfAndHalfGrupo === "") payload.halfAndHalfGrupo = null;
            if (payload.addOnGroupId === "" || payload.addOnGroupId == null) payload.addOnGroupId = null;
            if (payload.idUniplus === "") payload.idUniplus = null;
            payload.isCombo = Boolean(payload.isCombo);
            if (payload.isCombo) {
                payload.variablePrice = false;
                payload.allowsHalfAndHalf = false;
                payload.halfAndHalfPriceRule = null;
                payload.halfAndHalfGrupo = null;
                payload.addOnGroupId = null;
                payload.variations = [];
                payload.isMenuProduct = true;
                payload.comboItems = (payload.comboItems || []).map((ci, idx) => ({
                    productId: Number(ci.productId),
                    value: Number(ci.value) || 0,
                    quantity: Math.max(1, Number(ci.quantity) || 1),
                    order: idx,
                    variationOptionId:
                        ci.variationOptionId != null && ci.variationOptionId !== ""
                            ? Number(ci.variationOptionId)
                            : null,
                }));
                payload.value = calcComboTotal(payload.comboItems);
            } else {
                payload.comboItems = [];
                payload.variations = (payload.variations || []).filter((v) => v.name && v.options && v.options.length > 0).map((v) => ({
                    name: v.name.trim(),
                    options: v.options.map((o) => ({
                        label: String(o.label).trim(),
                        value: Number(o.value),
                        idUniplus: o.idUniplus ? String(o.idUniplus).trim() : null,
                    })),
                }));
            }
            if (productId) {
                await api.put(`/products/${productId}`, payload);
                toast.success("Produto atualizado com sucesso");
            } else {
                await api.post("/products", payload);
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
                maxWidth="md"
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
                                {!values.isCombo && (
                                <FormControl variant="outlined" margin="dense" fullWidth>
                                    <InputLabel id="addon-group-label">Grupo de adicionais</InputLabel>
                                    <Field
                                        as={Select}
                                        labelId="addon-group-label"
                                        name="addOnGroupId"
                                        label="Grupo de adicionais"
                                        value={values.addOnGroupId ?? ""}
                                    >
                                        <MenuItem value="">
                                            <em>Nenhum</em>
                                        </MenuItem>
                                        {addOnGroups.map((g) => (
                                            <MenuItem key={g.id} value={g.id}>
                                                {g.name}
                                            </MenuItem>
                                        ))}
                                    </Field>
                                </FormControl>
                                )}
                                {!values.isCombo && <><br /><br /></>}
                                {uniplusEnabled && (
                                    <>
                                        <Field
                                            as={TextField}
                                            label="Código UniPlus"
                                            name="idUniplus"
                                            error={touched.idUniplus && Boolean(errors.idUniplus)}
                                            helperText={
                                                (touched.idUniplus && errors.idUniplus) ||
                                                "Campo «código» do cadastro UniPlus (visível na tela). Ex.: 1080 — não use o id interno (ex.: 177)."
                                            }
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            inputProps={{ maxLength: 20 }}
                                        />
                                        <br />
                                        <br />
                                    </>
                                )}
                                <div className={classes.multFieldLine}>
                                    <Field
                                        as={TextField}
                                        label={values.isCombo ? "Valor do combo (soma)" : "Valor"}
                                        name="value"
                                        type="number"
                                        inputProps={{ step: "0.01", min: "0" }}
                                        error={touched.value && Boolean(errors.value)}
                                        helperText={
                                            values.isCombo
                                                ? "Calculado automaticamente pelos itens do combo"
                                                : touched.value && errors.value
                                        }
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        required={!values.isCombo}
                                        disabled={Boolean(values.isCombo)}
                                        {...(values.isCombo
                                            ? { value: calcComboTotal(values.comboItems).toFixed(2) }
                                            : {})}
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
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.isCombo || false}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFieldValue("isCombo", checked);
                                                if (checked) {
                                                    setFieldValue("variablePrice", false);
                                                    setFieldValue("allowsHalfAndHalf", false);
                                                    setFieldValue("halfAndHalfPriceRule", "");
                                                    setFieldValue("halfAndHalfGrupo", "");
                                                    setFieldValue("addOnGroupId", null);
                                                    setFieldValue("variations", []);
                                                    setFieldValue("isMenuProduct", true);
                                                    if (!values.comboItems?.length) {
                                                        setFieldValue("comboItems", []);
                                                    }
                                                    setFieldValue("value", calcComboTotal(values.comboItems || []));
                                                } else {
                                                    setFieldValue("comboItems", []);
                                                }
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label="É combo"
                                />
                                {values.isCombo && (() => {
                                    const selectable = buildComboSelectableOptions(menuProductsForCombo);
                                    const selectedKeys = new Set(
                                        (values.comboItems || []).map(
                                            (ci) =>
                                                `${ci.productId}_${ci.variationOptionId || 0}`
                                        )
                                    );
                                    const available = selectable.filter((o) => !selectedKeys.has(`${o.productId}_${o.variationOptionId || 0}`));
                                    return (
                                    <Box mt={1} mb={2} p={1.5} border={1} borderColor="divider" borderRadius={8}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Itens do combo
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                                            Selecione produtos (e tamanhos/variações) e defina o valor de cada um no combo. A soma será o preço cobrado.
                                        </Typography>
                                        <Box display="flex" alignItems="center" style={{ gap: 8, marginBottom: 12 }}>
                                            <FormControl variant="outlined" margin="dense" size="small" style={{ flex: 1 }}>
                                                <InputLabel>Adicionar produto / variação</InputLabel>
                                                <Select
                                                    label="Adicionar produto / variação"
                                                    value={comboProductToAdd}
                                                    onChange={(e) => setComboProductToAdd(e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>Selecione</em>
                                                    </MenuItem>
                                                    {available.map((o) => (
                                                        <MenuItem key={o.key} value={o.key}>
                                                            {o.productName}
                                                            {o.grupo ? ` (${o.grupo})` : ""} — R${" "}
                                                            {Number(o.value || 0).toFixed(2).replace(".", ",")}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<AddIcon />}
                                                disabled={!comboProductToAdd}
                                                onClick={() => {
                                                    const opt = selectable.find((o) => o.key === comboProductToAdd);
                                                    if (!opt) return;
                                                    const next = [
                                                        ...(values.comboItems || []),
                                                        {
                                                            productId: opt.productId,
                                                            variationOptionId: opt.variationOptionId,
                                                            productName: opt.productName,
                                                            value: Number(opt.value) || 0,
                                                            quantity: 1,
                                                        },
                                                    ];
                                                    setFieldValue("comboItems", next);
                                                    setFieldValue("value", calcComboTotal(next));
                                                    setComboProductToAdd("");
                                                }}
                                            >
                                                Adicionar
                                            </Button>
                                        </Box>
                                        {menuProductsForCombo.length === 0 && (
                                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                                                Nenhum produto de cardápio disponível. Cadastre produtos (não-combo) antes.
                                            </Typography>
                                        )}
                                        {(values.comboItems || []).length === 0 && (
                                            <Typography variant="body2" color="error">
                                                Adicione pelo menos um produto ao combo.
                                            </Typography>
                                        )}
                                        {(values.comboItems || []).map((ci, idx) => (
                                            <Box
                                                key={`${ci.productId}_${ci.variationOptionId || 0}_${idx}`}
                                                display="flex"
                                                alignItems="center"
                                                flexWrap="wrap"
                                                mb={1}
                                                style={{ gap: 8 }}
                                            >
                                                <Typography variant="body2" style={{ flex: 1, minWidth: 120 }}>
                                                    {ci.productName || `Produto #${ci.productId}`}
                                                </Typography>
                                                <TextField
                                                    label="Qtd"
                                                    type="number"
                                                    size="small"
                                                    variant="outlined"
                                                    margin="dense"
                                                    inputProps={{ min: 1, step: 1 }}
                                                    style={{ width: 80 }}
                                                    value={ci.quantity ?? 1}
                                                    onChange={(e) => {
                                                        const next = [...(values.comboItems || [])];
                                                        next[idx] = {
                                                            ...next[idx],
                                                            quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                                                        };
                                                        setFieldValue("comboItems", next);
                                                        setFieldValue("value", calcComboTotal(next));
                                                    }}
                                                />
                                                <TextField
                                                    label="Valor no combo"
                                                    type="number"
                                                    size="small"
                                                    variant="outlined"
                                                    margin="dense"
                                                    inputProps={{ min: 0, step: "0.01" }}
                                                    style={{ width: 130 }}
                                                    value={ci.value ?? 0}
                                                    InputProps={{ startAdornment: "R$ " }}
                                                    onChange={(e) => {
                                                        const next = [...(values.comboItems || [])];
                                                        next[idx] = {
                                                            ...next[idx],
                                                            value: parseFloat(e.target.value) || 0,
                                                        };
                                                        setFieldValue("comboItems", next);
                                                        setFieldValue("value", calcComboTotal(next));
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    title="Remover"
                                                    onClick={() => {
                                                        const next = (values.comboItems || []).filter((_, i) => i !== idx);
                                                        setFieldValue("comboItems", next);
                                                        setFieldValue("value", calcComboTotal(next));
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        {(values.comboItems || []).length > 0 && (
                                            <Typography variant="subtitle2" style={{ marginTop: 8 }}>
                                                Total do combo: R${" "}
                                                {calcComboTotal(values.comboItems).toFixed(2).replace(".", ",")}
                                            </Typography>
                                        )}
                                    </Box>
                                    );
                                })()}
                                {!values.isCombo && (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.variablePrice || false}
                                            onChange={(e) =>
                                                setFieldValue("variablePrice", e.target.checked)
                                            }
                                            color="primary"
                                        />
                                    }
                                    label="Preço variável"
                                />
                                )}
                                {!values.isCombo && values.variablePrice && (
                                    <Box mt={0.5} mb={1}>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Ao adicionar em pedidos (Mesas/Garçom), o valor será solicitado (ex.: refeição por kg). O valor acima serve como sugestão.
                                        </Typography>
                                    </Box>
                                )}
                                <br />
                                {!values.isCombo && (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.allowsHalfAndHalf || false}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFieldValue("allowsHalfAndHalf", checked);
                                                if (checked && !values.halfAndHalfPriceRule)
                                                    setFieldValue("halfAndHalfPriceRule", "max");
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label="Permitir meio a meio (ex.: pizza dois sabores)"
                                />
                                )}
                                {!values.isCombo && values.allowsHalfAndHalf && (
                                    <Box mt={1} mb={1}>
                                        <FormControl variant="outlined" margin="dense" fullWidth size="small">
                                            <InputLabel>Regra de cobrança</InputLabel>
                                            <Field
                                                as={Select}
                                                name="halfAndHalfPriceRule"
                                                label="Regra de cobrança"
                                                value={values.halfAndHalfPriceRule || ""}
                                            >
                                                <MenuItem value="max">Sabor mais caro</MenuItem>
                                                <MenuItem value="fixed">Preço fixo do tamanho</MenuItem>
                                                <MenuItem value="average">Média dos dois sabores</MenuItem>
                                            </Field>
                                        </FormControl>
                                        <FormControl variant="outlined" margin="dense" fullWidth size="small" style={{ marginTop: 8 }}>
                                            <InputLabel>Grupo dos sabores (opcional)</InputLabel>
                                            <Field
                                                as={Select}
                                                name="halfAndHalfGrupo"
                                                label="Grupo dos sabores (opcional)"
                                                value={values.halfAndHalfGrupo || ""}
                                            >
                                                <MenuItem value="">
                                                    <em>Qualquer grupo</em>
                                                </MenuItem>
                                                {availableGroups.map((group) => (
                                                    <MenuItem key={group} value={group}>
                                                        {group}
                                                    </MenuItem>
                                                ))}
                                            </Field>
                                        </FormControl>
                                        <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 4 }}>
                                            No cardápio, ao clicar neste produto o cliente escolherá duas metades (sabores). Se informar grupo, só produtos desse grupo poderão ser escolhidos.
                                        </Typography>
                                    </Box>
                                )}
                                {!values.isCombo && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2" gutterBottom>Variações (ex.: Tamanho, Cor)</Typography>
                                    <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                                        Adicione variações com opções e valores diferentes (ex.: P R$ 10, M R$ 15, G R$ 20).
                                    </Typography>
                                    {uniplusEnabled &&
                                        (values.variations || []).some((v) => (v.options || []).length > 0) && (
                                            <Box mb={1} display="flex" flexWrap="wrap" style={{ gap: 6 }}>
                                                {(values.variations || []).map((variation, vIdx) => {
                                                    const opts = variation.options || [];
                                                    if (opts.length === 0) return null;
                                                    const linked = opts.filter(
                                                        (o) => o.idUniplus && String(o.idUniplus).trim()
                                                    ).length;
                                                    const allLinked = linked === opts.length;
                                                    return (
                                                        <Chip
                                                            key={vIdx}
                                                            size="small"
                                                            label={`${variation.name || `Variação ${vIdx + 1}`}: ${linked}/${opts.length} c/ UniPlus`}
                                                            title="Quantas opções desta variação já têm código UniPlus vinculado"
                                                            style={{
                                                                fontWeight: 600,
                                                                backgroundColor:
                                                                    linked === 0
                                                                        ? "#eef2f5"
                                                                        : allLinked
                                                                        ? "#e8f8ef"
                                                                        : "#fff4e5",
                                                                color:
                                                                    linked === 0
                                                                        ? "#5b6b76"
                                                                        : allLinked
                                                                        ? "#027a48"
                                                                        : "#b54708",
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    {(values.variations || []).map((variation, vIdx) => (
                                        <Box key={vIdx} mb={2} p={1.5} border={1} borderColor="divider" borderRadius={8}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                <TextField
                                                    label="Nome da variação"
                                                    placeholder="Ex: Tamanho"
                                                    value={variation.name || ""}
                                                    onChange={(e) => {
                                                        const next = [...(values.variations || [])];
                                                        next[vIdx] = { ...next[vIdx], name: e.target.value };
                                                        setFieldValue("variations", next);
                                                    }}
                                                    variant="outlined"
                                                    margin="dense"
                                                    size="small"
                                                    style={{ flex: 1, marginRight: 8 }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        const next = (values.variations || []).filter((_, i) => i !== vIdx);
                                                        setFieldValue("variations", next);
                                                    }}
                                                    title="Remover variação"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                            {(variation.options || []).map((opt, oIdx) => (
                                                <Box key={oIdx} display="flex" alignItems="center" gap={8} mb={0.5} ml={1} flexWrap="wrap">
                                                    <TextField
                                                        label="Opção"
                                                        placeholder="Ex: P, M, G"
                                                        value={opt.label || ""}
                                                        onChange={(e) => {
                                                            const next = [...(values.variations || [])];
                                                            next[vIdx].options = [...(next[vIdx].options || [])];
                                                            next[vIdx].options[oIdx] = { ...next[vIdx].options[oIdx], label: e.target.value };
                                                            setFieldValue("variations", next);
                                                        }}
                                                        variant="outlined"
                                                        margin="dense"
                                                        size="small"
                                                        style={{ width: 120 }}
                                                    />
                                                    <TextField
                                                        label="Valor (R$)"
                                                        type="number"
                                                        inputProps={{ step: "0.01", min: "0" }}
                                                        value={opt.value ?? ""}
                                                        onChange={(e) => {
                                                            const next = [...(values.variations || [])];
                                                            next[vIdx].options = [...(next[vIdx].options || [])];
                                                            next[vIdx].options[oIdx] = { ...next[vIdx].options[oIdx], value: parseFloat(e.target.value) || 0 };
                                                            setFieldValue("variations", next);
                                                        }}
                                                        variant="outlined"
                                                        margin="dense"
                                                        size="small"
                                                        style={{ width: 100 }}
                                                    />
                                                    {uniplusEnabled && (
                                                        <TextField
                                                            label="Cód. UniPlus"
                                                            placeholder="codigo"
                                                            value={opt.idUniplus || ""}
                                                            onChange={(e) => {
                                                                const next = [...(values.variations || [])];
                                                                next[vIdx].options = [...(next[vIdx].options || [])];
                                                                next[vIdx].options[oIdx] = {
                                                                    ...next[vIdx].options[oIdx],
                                                                    idUniplus: e.target.value,
                                                                };
                                                                setFieldValue("variations", next);
                                                            }}
                                                            variant="outlined"
                                                            margin="dense"
                                                            size="small"
                                                            inputProps={{ maxLength: 20 }}
                                                            style={{ width: 120 }}
                                                        />
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            const next = [...(values.variations || [])];
                                                            next[vIdx].options = (next[vIdx].options || []).filter((_, i) => i !== oIdx);
                                                            setFieldValue("variations", next);
                                                        }}
                                                        title="Remover opção"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                            <Button
                                                size="small"
                                                startIcon={<AddIcon />}
                                                onClick={() => {
                                                    const next = [...(values.variations || [])];
                                                    if (!next[vIdx].options) next[vIdx].options = [];
                                                    next[vIdx].options.push({ label: "", value: 0, idUniplus: "" });
                                                    setFieldValue("variations", next);
                                                }}
                                                style={{ marginLeft: 8, marginTop: 4 }}
                                            >
                                                Adicionar opção
                                            </Button>
                                        </Box>
                                    ))}
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setFieldValue("variations", [...(values.variations || []), { name: "", options: [{ label: "", value: 0, idUniplus: "" }] }])}
                                    >
                                        Adicionar variação
                                    </Button>
                                </Box>
                                )}
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
