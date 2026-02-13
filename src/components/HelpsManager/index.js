import React, { useState, useEffect, useContext } from "react";
import {
    makeStyles,
    Paper,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    Tabs,
    Tab,
    Chip,
    Button
} from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";
import HelpArticleEditor from "../HelpArticleEditor";

import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import useHelps from "../../hooks/useHelps";
import useHelpArticles from "../../hooks/useHelpArticles";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";


const useStyles = makeStyles(theme => ({
	root: {
		width: '100%'
	},
    mainPaper: {
		width: '100%',
		flex: 1,
		padding: theme.spacing(2)
    },
	fullWidth: {
		width: '100%'
	},
    tableContainer: {
		width: '100%',
		overflowX: "scroll",
		...theme.scrollbarStyles
    },
	textfield: {
		width: '100%'
	},
    textRight: {
        textAlign: 'right'
    },
    row: {
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2)
    },
    control: {
		paddingRight: theme.spacing(1),
		paddingLeft: theme.spacing(1)
	},
  buttonContainer: {
    textAlign: 'right',
    padding: theme.spacing(1)
  },
  tabsContainer: {
    marginBottom: theme.spacing(2),
  },
  buttonNew: {
    marginBottom: theme.spacing(2),
  }
}));

export function HelpManagerForm (props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles()

    const [record, setRecord] = useState(initialValue);

    useEffect(() => {
        setRecord(initialValue)
    }, [initialValue])

    const handleSubmit = async(data) => {
        onSubmit(data)
    }

    return (
        <Formik
            enableReinitialize
            className={classes.fullWidth}
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => {
                    handleSubmit(values)
                    resetForm()
                }, 500)
            }
        >
            {(values) => (
                <Form className={classes.fullWidth}>
                    <Grid spacing={2} justifyContent="flex-end" container>
                        <Grid xs={12} sm={6} md={3} item>
                            <Field
                                as={TextField}
                                label="Título"
                                name="title"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                            />
                        </Grid>
                        <Grid xs={12} sm={6} md={3} item>
                            <Field
                                as={TextField}
                                label="Código do Vídeo"
                                name="video"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                            />
                        </Grid>
                        <Grid xs={12} sm={12} md={6} item>
                            <Field
                                as={TextField}
                                label="Descrição"
                                name="description"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                            />
                        </Grid>
                        <Grid sm={3} md={1} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onCancel()} variant="contained">
                                {i18n.t('settings.helps.buttons.clean')}
                            </ButtonWithSpinner>
                        </Grid>
                        { record.id !== undefined ? (
                            <Grid sm={3} md={1} item>
                                <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onDelete(record)} variant="contained" color="secondary">
                                    {i18n.t('settings.helps.buttons.delete')}
                                </ButtonWithSpinner>
                            </Grid>
                        ) : null}
                        <Grid sm={3} md={1} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} type="submit" variant="contained" color="primary">
                                {i18n.t('settings.helps.buttons.save')}
                            </ButtonWithSpinner>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    )
}

export function HelpsManagerGrid (props) {
    const { records, onSelect } = props
    const classes = useStyles()

    return (
        <Paper className={classes.tableContainer}>
            <Table className={classes.fullWidth} size="small" aria-label="a dense table">
                <TableHead>
                <TableRow>
                    <TableCell align="center" style={{width: '1%'}}>#</TableCell>
                    <TableCell align="left">{i18n.t("settings.helps.grid.title")}</TableCell>
                    <TableCell align="left">{i18n.t("settings.helps.grid.description")}</TableCell>
                    <TableCell align="left">{i18n.t("settings.helps.grid.video")}</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {records.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell align="center" style={{width: '1%'}}>
                            <IconButton onClick={() => onSelect(row)} aria-label="delete">
                                <EditIcon />
                            </IconButton>
                        </TableCell>
                        <TableCell align="left">{row.title || '-'}</TableCell>
                        <TableCell align="left">{row.description || '-'}</TableCell>
                        <TableCell align="left">{row.video || '-'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default function HelpsManager () {
    const classes = useStyles()
    const { user } = useContext(AuthContext)
    const { list, save, update, remove } = useHelps()
    const { list: listArticles, save: saveArticle, update: updateArticle, remove: removeArticle } = useHelpArticles()
    
    const [tabValue, setTabValue] = useState(0)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [showArticleConfirmDialog, setShowArticleConfirmDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState([])
    const [articles, setArticles] = useState([])
    const [record, setRecord] = useState({
        title: '',
        description: '',
        video: ''
    })
    const [articleRecord, setArticleRecord] = useState(null)
    const [showArticleForm, setShowArticleForm] = useState(false)
    
    const isCompanyOne = user?.companyId === 1

    useEffect(() => {
        async function fetchData () {
            await loadHelps()
            if (isCompanyOne) {
                await loadArticles()
            }
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCompanyOne])

    const loadHelps = async () => {
        setLoading(true)
        try {
            const helpList = await list()
            setRecords(helpList)
        } catch (e) {
            toast.error(i18n.t('settings.helps.toasts.errorList'))
        }
        setLoading(false)
    }

    const handleSubmit = async (data) => {
        setLoading(true)
        try {
            if (data.id !== undefined) {
                await update(data)
            } else {
                await save(data)
            }
            await loadHelps()
            handleCancel()
            toast.success(i18n.t('settings.helps.toasts.success'))
        } catch (e) {
            toast.error(i18n.t('settings.helps.toasts.error'))
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await remove(record.id)
            await loadHelps()
            handleCancel()
            toast.success(i18n.t('settings.helps.toasts.success'))
        } catch (e) {
            toast.error(i18n.t('settings.helps.toasts.errorOperation'))
        }
        setLoading(false)
    }

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true)
    }

    const handleCancel = () => {
        setRecord({
            title: '',
            description: '',
            video: ''
        })
    }

    const handleSelect = (data) => {
        setRecord({
            id: data.id,
            title: data.title || '',
            description: data.description || '',
            video: data.video || ''
        })
    }

    const loadArticles = async () => {
        setLoading(true)
        try {
            const data = await listArticles({})
            setArticles(data.records || [])
        } catch (e) {
            toast.error('Erro ao carregar artigos')
        }
        setLoading(false)
    }

    const handleArticleSubmit = async (data) => {
        setLoading(true)
        try {
            if (data.id !== undefined) {
                await updateArticle(data)
            } else {
                await saveArticle(data)
            }
            await loadArticles()
            handleArticleCancel()
            toast.success('Artigo salvo com sucesso')
        } catch (e) {
            toast.error('Erro ao salvar artigo')
        }
        setLoading(false)
    }

    const handleArticleDelete = async () => {
        setLoading(true)
        try {
            await removeArticle(articleRecord.id)
            await loadArticles()
            handleArticleCancel()
            setShowArticleConfirmDialog(false)
            toast.success('Artigo deletado com sucesso')
        } catch (e) {
            toast.error('Erro ao deletar artigo')
        }
        setLoading(false)
    }

    const handleArticleCancel = () => {
        setArticleRecord(null)
        setShowArticleForm(false)
    }

    const handleArticleSelect = (data) => {
        setArticleRecord(data)
        setShowArticleForm(true)
    }

    const handleNewArticle = () => {
        setArticleRecord({
            title: '',
            content: '',
            summary: '',
            keywords: '',
            category: 'Outros',
            order: 0,
            isActive: true,
        })
        setShowArticleForm(true)
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        setShowArticleForm(false)
        setArticleRecord(null)
    }

    return (
        <Paper className={classes.mainPaper} elevation={0}>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                className={classes.tabsContainer}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="Vídeos" />
                {isCompanyOne && <Tab label="Artigos" />}
            </Tabs>

            {tabValue === 0 && (
                <Grid spacing={2} container>
                    <Grid xs={12} item>
                        <HelpManagerForm 
                            initialValue={record} 
                            onDelete={handleOpenDeleteDialog} 
                            onSubmit={handleSubmit} 
                            onCancel={handleCancel} 
                            loading={loading}
                        />
                    </Grid>
                    <Grid xs={12} item>
                        <HelpsManagerGrid 
                            records={records}
                            onSelect={handleSelect}
                        />
                    </Grid>
                </Grid>
            )}

            {tabValue === 1 && isCompanyOne && (
                <Grid spacing={2} container>
                    {showArticleForm && (
                        <Grid xs={12} item>
                            <HelpArticleEditor
                                initialValue={articleRecord}
                                onDelete={() => setShowArticleConfirmDialog(true)}
                                onSubmit={handleArticleSubmit}
                                onCancel={handleArticleCancel}
                                loading={loading}
                            />
                        </Grid>
                    )}
                    {!showArticleForm && (
                        <Grid xs={12} item>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleNewArticle}
                                className={classes.buttonNew}
                            >
                                Novo Artigo
                            </Button>
                        </Grid>
                    )}
                    <Grid xs={12} item>
                        <Paper className={classes.tableContainer}>
                            <Table className={classes.fullWidth} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '1%' }}>Ações</TableCell>
                                        <TableCell align="left">Título</TableCell>
                                        <TableCell align="left">Categoria</TableCell>
                                        <TableCell align="center">Ordem</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="left">Palavras-chave</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {articles.length > 0 ? articles.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell align="center" style={{ width: '1%' }}>
                                                <IconButton onClick={() => handleArticleSelect(row)} aria-label="edit" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setArticleRecord(row)
                                                        setShowArticleConfirmDialog(true)
                                                    }}
                                                    aria-label="delete"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell align="left">{row.title || '-'}</TableCell>
                                            <TableCell align="left">
                                                {row.category ? (
                                                    <Chip label={row.category} size="small" color="primary" />
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">{row.order || 0}</TableCell>
                                            <TableCell align="center">
                                                {row.isActive ? (
                                                    <Chip label="Ativo" size="small" color="primary" />
                                                ) : (
                                                    <Chip label="Inativo" size="small" />
                                                )}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.keywords
                                                    ? row.keywords.split(',').slice(0, 3).map((k, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={k.trim()}
                                                            size="small"
                                                            variant="outlined"
                                                            style={{ marginRight: 4 }}
                                                        />
                                                    ))
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                Nenhum artigo encontrado
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <ConfirmationModal
                title={i18n.t('settings.helps.confirmModal.title')}
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={() => handleDelete()}
            >
                {i18n.t('settings.helps.confirmModal.confirm')}
            </ConfirmationModal>

            <ConfirmationModal
                title="Confirmar exclusão"
                open={showArticleConfirmDialog}
                onClose={() => setShowArticleConfirmDialog(false)}
                onConfirm={handleArticleDelete}
            >
                Tem certeza que deseja excluir este artigo?
            </ConfirmationModal>
        </Paper>
    )
}