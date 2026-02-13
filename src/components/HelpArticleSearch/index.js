import React, { useState, useEffect } from "react";
import { makeStyles, TextField, MenuItem, Box, InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import useHelpArticles from "../../hooks/useHelpArticles";

const useStyles = makeStyles((theme) => ({
  searchContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  searchField: {
    flex: 1,
    minWidth: 250,
  },
  categoryField: {
    minWidth: 200,
  },
}));

const CATEGORIES = [
  "Configuração",
  "Campanhas",
  "Tickets",
  "Contatos",
  "Integrações",
  "Relatórios",
  "Outros",
];

const HelpArticleSearch = ({ onSearch, onCategoryChange }) => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (onSearch) {
        onSearch(searchParam);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, onSearch]);

  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  }, [category, onCategoryChange]);

  const handleSearchChange = (event) => {
    setSearchParam(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  return (
    <Box className={classes.searchContainer}>
      <TextField
        className={classes.searchField}
        placeholder="Buscar artigos..."
        variant="outlined"
        size="small"
        value={searchParam}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={classes.categoryField}
        select
        label="Categoria"
        variant="outlined"
        size="small"
        value={category}
        onChange={handleCategoryChange}
      >
        <MenuItem value="">Todas</MenuItem>
        {CATEGORIES.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default HelpArticleSearch;
