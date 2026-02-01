import React, { useEffect, useRef, useState } from "react";
import { Chip, IconButton, Menu, MenuItem, Typography, Box, TextField, makeStyles, useTheme } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { isArray, isString } from "lodash";
import LabelIcon from "@material-ui/icons/Label";
import toastError from "../../errors/toastError";
import api from "../../services/api";

// Função para converter cores vibrantes em cores neutras
const getNeutralColor = (originalColor) => {
	if (!originalColor) return "#6B7280";
	
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
	
	const hash = originalColor.split("").reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);
	
	return neutralPalette[Math.abs(hash) % neutralPalette.length];
};

const useStyles = makeStyles((theme) => ({
	menu: {
		"& .MuiPaper-root": {
			minWidth: 320,
			maxWidth: 400,
			padding: theme.spacing(2),
		},
	},
	menuSection: {
		marginBottom: theme.spacing(2),
		"&:last-child": {
			marginBottom: 0,
		},
	},
	menuSectionTitle: {
		fontSize: "0.75rem",
		fontWeight: 600,
		color: theme.palette.text.secondary,
		textTransform: "uppercase",
		letterSpacing: "0.5px",
		marginBottom: theme.spacing(1),
	},
	tagChip: {
		marginRight: theme.spacing(0.5),
		marginBottom: theme.spacing(0.5),
		fontSize: "0.75rem",
	},
	selectedTagsContainer: {
		display: "flex",
		flexWrap: "wrap",
		gap: theme.spacing(0.5),
		marginTop: theme.spacing(1),
		minHeight: 40,
	},
	emptyTags: {
		color: theme.palette.text.secondary,
		fontSize: "0.875rem",
		fontStyle: "italic",
	},
}));

export function TagsDropdown({ ticket }) {
	const classes = useStyles();
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = useState(null);
	const [tags, setTags] = useState([]);
	const [selecteds, setSelecteds] = useState([]);
	const isMounted = useRef(true);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (isMounted.current && ticket) {
			loadTags().then(() => {
				if (Array.isArray(ticket.tags)) {
					setSelecteds(ticket.tags);
				} else {
					setSelecteds([]);
				}
			});
		}
	}, [ticket]);

	const createTag = async (data) => {
		try {
			const { data: responseData } = await api.post(`/tags`, data);
			return responseData;
		} catch (err) {
			toastError(err);
		}
	};

	const loadTags = async () => {
		try {
			const { data } = await api.get(`/tags/list`);
			setTags(data);
		} catch (err) {
			toastError(err);
		}
	};

	const syncTags = async (data) => {
		try {
			const { data: responseData } = await api.post(`/tags/sync`, data);
			return responseData;
		} catch (err) {
			toastError(err);
		}
	};

	const onChange = async (value, reason) => {
		let optionsChanged = [];
		if (reason === "create-option") {
			if (isArray(value)) {
				for (let item of value) {
					if (isString(item)) {
						const newTag = await createTag({ name: item });
						optionsChanged.push(newTag);
					} else {
						optionsChanged.push(item);
					}
				}
			}
			await loadTags();
		} else {
			optionsChanged = value;
		}
		setSelecteds(optionsChanged);
		await syncTags({ ticketId: ticket.id, tags: optionsChanged });
	};

	const handleOpenMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	const menuOpen = Boolean(anchorEl);
	const hasTags = selecteds && selecteds.length > 0;

	// Não exibir tags em grupos
	if (ticket?.isGroup) {
		return null;
	}

	return (
		<>
			<IconButton
				onClick={handleOpenMenu}
				size="small"
				style={{
					position: "relative",
				}}
			>
				<LabelIcon />
				{hasTags && (
					<span
						style={{
							position: "absolute",
							top: 4,
							right: 4,
							width: 8,
							height: 8,
							borderRadius: "50%",
							backgroundColor: theme.palette.primary.main,
							border: `2px solid ${theme.palette.background.paper}`,
						}}
					/>
				)}
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={menuOpen}
				onClose={handleCloseMenu}
				className={classes.menu}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				<Box className={classes.menuSection}>
					<Typography className={classes.menuSectionTitle}>Tags</Typography>
					<Autocomplete
						multiple
						size="small"
						options={tags}
						value={selecteds}
						freeSolo
						onChange={(e, v, r) => onChange(v, r)}
						getOptionLabel={(option) => option.name}
						renderInput={(params) => (
							<TextField
								{...params}
								variant="outlined"
								placeholder="Adicionar tags..."
								size="small"
							/>
						)}
						PaperComponent={({ children }) => (
							<Box
								style={{
									backgroundColor: theme.palette.background.paper,
									borderRadius: theme.spacing(1),
									border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
								}}
							>
								{children}
							</Box>
						)}
					/>
					<Box className={classes.selectedTagsContainer}>
						{hasTags ? (
							selecteds.map((option, index) => {
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
										size="small"
										className={classes.tagChip}
									/>
								);
							})
						) : (
							<Typography className={classes.emptyTags}>
								Nenhuma tag selecionada
							</Typography>
						)}
					</Box>
				</Box>
			</Menu>
		</>
	);
}

