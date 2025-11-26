import { Box, Chip, TextField, makeStyles, useTheme } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

// Função para converter cores vibrantes em cores neutras
const getNeutralColor = (originalColor) => {
	if (!originalColor) return "#6B7280";
	
	// Paleta de cores neutras
	const neutralPalette = [
		"#6B7280", // Gray 500
		"#9CA3AF", // Gray 400
		"#D1D5DB", // Gray 300
		"#E0E7FF", // Indigo 100
		"#DBEAFE", // Blue 100
		"#E0F2FE", // Cyan 100
		"#D1FAE5", // Emerald 100
		"#ECFDF5", // Green 50
		"#F3F4F6", // Gray 100
		"#E5E7EB", // Gray 200
	];
	
	// Hash simples baseado na cor original para escolher uma cor neutra consistente
	const hash = originalColor.split("").reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);
	
	return neutralPalette[Math.abs(hash) % neutralPalette.length];
};

const useStyles = makeStyles((theme) => ({
	container: {
		padding: theme.spacing(1.5),
		backgroundColor: theme.palette.background.paper,
		borderRadius: theme.spacing(1.5),
	},
	tagChip: {
		borderRadius: theme.spacing(1.5),
		fontWeight: 500,
		fontSize: "0.8125rem",
		padding: theme.spacing(0.5, 1),
		marginRight: theme.spacing(0.75),
		marginBottom: theme.spacing(0.5),
		transition: "all 0.2s ease",
		boxShadow: theme.palette.type === "dark" 
			? "0 1px 3px rgba(0, 0, 0, 0.3)" 
			: "0 1px 3px rgba(0, 0, 0, 0.1)",
		"&:hover": {
			transform: "translateY(-1px)",
			boxShadow: theme.palette.type === "dark" 
				? "0 2px 6px rgba(0, 0, 0, 0.4)" 
				: "0 2px 6px rgba(0, 0, 0, 0.15)",
		},
	},
}));

export function TagsFilter({ onFiltered }) {
  const classes = useStyles();
  const theme = useTheme();
  const [tags, setTags] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadTags();
    }
    fetchData();
  }, []);

  const loadTags = async () => {
    try {
      const { data } = await api.get(`/tags/list`);
      setTags(data);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value) => {
    setSelecteds(value);
    onFiltered(value);
  };

  return (
    <Box className={classes.container}>
      <Autocomplete
        multiple
        size="small"
        options={tags}
        value={selecteds}
        onChange={(e, v, r) => onChange(v)}
        getOptionLabel={(option) => option.name}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const neutralColor = getNeutralColor(option.color);
            const isDark = theme.palette.type === "dark";
            const textColor = isDark ? "#FFFFFF" : "#1F2937";
            
            return (
              <Chip
                key={index}
                variant="filled"
                style={{
                  backgroundColor: neutralColor,
                  color: textColor,
                  border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                }}
                label={option.name}
                {...getTagProps({ index })}
                size="small"
                className={classes.tagChip}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={i18n.t("tickets.filters.tags")}
            style={{
              backgroundColor: theme.palette.background.paper,
            }}
          />
        )}
      />
    </Box>
  );
}
