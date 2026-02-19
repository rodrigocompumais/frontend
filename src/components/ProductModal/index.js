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
        .required("Valor é obrigatório")
        .min(0, "Valor deve ser maior ou igual a zero"),
    quantity: Yup.number()
        .integer("Quantidade deve ser um número inteiro")
        .min(0, "Quantidade deve ser maior ou igual a zero")
        .nullable(),
    isMenuProduct: Yup.boolean().nullable(),
    variablePrice: Yup.boolean().nullable(),
    allowsHalfAndHalf: Yup.boolean().nullable(),
    halfAndHalfPriceRule: Yup.string().oneOf(["max", "fixed", "average"]).nullable(),
    halfAndHalfGrupo: Yup.string().nullable(),
    grupo: Yup.string().nullable(),
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
                        })
                    )
                    .required(),
            })
        )
        .nullable(),
}).test(
    "halfAndHalfRule",
    "Regra de cobrança é obrigatória quando 'Permitir meio a meio' está ativo",
    (obj) => {
        if (obj?.allowsHalfAndHalf === true)
            return obj?.halfAndHalfPriceRule != null && ["max", "fixed", "average"].includes(obj.halfAndHalfPriceRule);
        return true;
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
        allowsHalfAndHalf: false,
        halfAndHalfPriceRule: "",
        halfAndHalfGrupo: "",
        grupo: "",
        imageUrl: "",
        variations: [],
    };

    const [product, setProduct] = useState(initialState);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const imageInputRef = React.useRef(null);
    
    // Adicionar grupos do produto aos grupos disponíveis quando o produto mudar
    useEffect(() => {
        if (product.grupo && product.grupo.trim() !== "") {
            setAvailableGroups((prevGroups) => {
                const grupo = product.grupo.trim();
                if (!prevGroups.includes(grupo)) {
                    const newGroups = [...prevGroups, grupo].sort((a, b) => a.localeCompare(b));
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:137',message:'Added grupo from product state',data:{grupo,prevCount:prevGroups.length,newCount:newGroups.length},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
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
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:147',message:'Added halfAndHalfGrupo from product state',data:{grupo,prevCount:prevGroups.length,newCount:newGroups.length},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
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
                    options: (v.options || []).map((o) => ({ label: o.label || "", value: parseFloat(o.value) || 0 })),
                }));
                
                const productGrupo = (data.grupo || "").trim();
                const productHalfAndHalfGrupo = (data.halfAndHalfGrupo || "").trim();
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:148',message:'Product loaded with groups',data:{productId:data?.id,productGrupo,productHalfAndHalfGrupo},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                
                // Adicionar grupos do produto aos grupos disponíveis ANTES de setProduct
                // para garantir que estejam disponíveis quando o Formik renderizar
                setAvailableGroups((prevGroups) => {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:152',message:'Updating availableGroups before setProduct',data:{prevGroupsCount:prevGroups.length,productGrupo,productHalfAndHalfGrupo},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    const newGroups = [...prevGroups];
                    let updated = false;
                    if (productGrupo && !newGroups.includes(productGrupo)) {
                        newGroups.push(productGrupo);
                        updated = true;
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:157',message:'Added productGrupo to availableGroups',data:{grupo:productGrupo,newGroupsCount:newGroups.length},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                    }
                    if (productHalfAndHalfGrupo && !newGroups.includes(productHalfAndHalfGrupo)) {
                        newGroups.push(productHalfAndHalfGrupo);
                        updated = true;
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:163',message:'Added productHalfAndHalfGrupo to availableGroups',data:{grupo:productHalfAndHalfGrupo,newGroupsCount:newGroups.length},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                    }
                    if (updated) {
                        newGroups.sort((a, b) => a.localeCompare(b));
                    }
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/654d036a-7e93-40a5-be06-4549cdbdbbac',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductModal/index.js:168',message:'Final availableGroups state before setProduct',data:{finalGroupsCount:newGroups.length,finalGroups:newGroups},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    return newGroups;
                });
                
                // Aguardar um tick para garantir que availableGroups foi atualizado
                await new Promise(resolve => setTimeout(resolve, 0));
                
                setProduct({
                    name: data.name || "",
                    description: data.description || "",
                    value: data.value || 0,
                    quantity: data.quantity || 0,
                    isMenuProduct: data.isMenuProduct || false,
                    variablePrice: data.variablePrice || false,
                    allowsHalfAndHalf: data.allowsHalfAndHalf || false,
                    halfAndHalfPriceRule: data.halfAndHalfPriceRule || "",
                    halfAndHalfGrupo: productHalfAndHalfGrupo,
                    grupo: productGrupo,
                    imageUrl: data.imageUrl || "",
                    variations,
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
            payload.variations = (payload.variations || []).filter((v) => v.name && v.options && v.options.length > 0).map((v) => ({
                name: v.name.trim(),
                options: v.options.map((o) => ({ label: String(o.label).trim(), value: Number(o.value) })),
            }));
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
                                {values.variablePrice && (
                                    <Box mt={0.5} mb={1}>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Ao adicionar em pedidos (Mesas/Garçom), o valor será solicitado (ex.: refeição por kg). O valor acima serve como sugestão.
                                        </Typography>
                                    </Box>
                                )}
                                <br />
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
                                {values.allowsHalfAndHalf && (
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
                                <Box mt={2}>
                                    <Typography variant="subtitle2" gutterBottom>Variações (ex.: Tamanho, Cor)</Typography>
                                    <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                                        Adicione variações com opções e valores diferentes (ex.: P R$ 10, M R$ 15, G R$ 20).
                                    </Typography>
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
                                                <Box key={oIdx} display="flex" alignItems="center" gap={8} mb={0.5} ml={1}>
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
                                                    next[vIdx].options.push({ label: "", value: 0 });
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
                                        onClick={() => setFieldValue("variations", [...(values.variations || []), { name: "", options: [{ label: "", value: 0 }] }])}
                                    >
                                        Adicionar variação
                                    </Button>
                                </Box>
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
