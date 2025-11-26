import { makeStyles, useTheme } from "@material-ui/styles";
import React from "react";

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

const useStyles = makeStyles(theme => ({
    tag: {
        padding: theme.spacing(0.5, 1),
        borderRadius: theme.spacing(1.5),
        fontSize: "0.8125rem",
        fontWeight: 500,
        marginRight: theme.spacing(0.75),
        marginTop: theme.spacing(0.5),
        whiteSpace: "nowrap",
        display: "inline-block",
        transition: "all 0.2s ease",
        boxShadow: theme.palette.type === "dark" 
			? "0 1px 3px rgba(0, 0, 0, 0.3)" 
			: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
        "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: theme.palette.type === "dark" 
				? "0 2px 6px rgba(0, 0, 0, 0.4)" 
				: "0 2px 6px rgba(0, 0, 0, 0.15)",
        },
    }
}));

const ContactTag = ({ tag }) => {
    const classes = useStyles();
    const theme = useTheme();
    const neutralColor = getNeutralColor(tag.color);
    const isDark = theme.palette.type === "dark";
    const textColor = isDark ? "#FFFFFF" : "#1F2937";

    return (
        <div 
            className={classes.tag} 
            style={{ 
                backgroundColor: neutralColor, 
                color: textColor,
            }}
        >
            {tag.name}
        </div>
    )
}

export default ContactTag;