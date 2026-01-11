import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import { flowBuilderTemplates, getAllCategories } from '../../data/flowBuilderTemplates';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      minWidth: '900px',
      maxWidth: '1200px',
      minHeight: '600px',
      borderRadius: 16,
      [theme.breakpoints.down('sm')]: {
        minWidth: '95%',
        margin: theme.spacing(2),
      },
    },
  },
  dialogTitle: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontWeight: 700,
    fontSize: '1.5rem',
  },
  dialogContent: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.type === 'dark' ? '#0f1419' : '#f5f7fa',
  },
  searchBox: {
    marginBottom: theme.spacing(3),
  },
  tabs: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 600,
      minHeight: 48,
    },
  },
  templateCard: {
    height: '100%',
    borderRadius: 12,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: `2px solid transparent`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
      borderColor: theme.palette.primary.main,
    },
  },
  selectedCard: {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[8],
  },
  templateIcon: {
    fontSize: '3rem',
    marginBottom: theme.spacing(1),
  },
  templateName: {
    fontWeight: 700,
    fontSize: '1.1rem',
    marginBottom: theme.spacing(1),
  },
  templateDescription: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  categoryChip: {
    fontWeight: 600,
    borderRadius: 8,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

const FlowBuilderTemplateSelector = ({ open, onClose, onSelectTemplate }) => {
  const classes = useStyles();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...getAllCategories()];

  const filteredTemplates = flowBuilderTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setSearchTerm('');
    setSelectedCategory('all');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={classes.dialog}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography className={classes.titleText}>
          📚 Escolha um Template
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={classes.searchBox}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            style: {
              borderRadius: 12,
            },
          }}
        />

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          className={classes.tabs}
        >
          <Tab label="Todos" value="all" />
          {categories.slice(1).map((category) => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6">Nenhum template encontrado</Typography>
            <Typography variant="body2">
              Tente ajustar os filtros de busca
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card
                  className={`${classes.templateCard} ${
                    selectedTemplate?.id === template.id ? classes.selectedCard : ''
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent>
                    <Box textAlign="center">
                      <div className={classes.templateIcon}>{template.icon}</div>
                      <Typography className={classes.templateName}>
                        {template.name}
                      </Typography>
                      <Typography className={classes.templateDescription}>
                        {template.description}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        className={classes.categoryChip}
                      />
                    </Box>
                  </CardContent>
                  <CardActions style={{ justifyContent: 'center', paddingBottom: 16 }}>
                    <Button
                      size="small"
                      variant={selectedTemplate?.id === template.id ? "contained" : "outlined"}
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template);
                      }}
                    >
                      {selectedTemplate?.id === template.id ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={!selectedTemplate}
          style={{ borderRadius: 8, fontWeight: 600 }}
        >
          Usar Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderTemplateSelector;
