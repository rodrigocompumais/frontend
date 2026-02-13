import React from "react";
import { makeStyles, Paper, Typography, IconButton, Chip, Box } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  title: {
    flex: 1,
    fontWeight: "bold",
  },
  categoryChip: {
    marginRight: theme.spacing(1),
  },
  keywordsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
  },
  contentPaper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  markdownContent: {
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    "& p": {
      marginBottom: theme.spacing(1),
    },
    "& ul, & ol": {
      marginBottom: theme.spacing(1),
      paddingLeft: theme.spacing(3),
    },
    "& code": {
      backgroundColor: theme.palette.grey[200],
      padding: "2px 4px",
      borderRadius: 3,
      fontSize: "0.9em",
    },
    "& pre": {
      backgroundColor: theme.palette.grey[200],
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      overflow: "auto",
      "& code": {
        backgroundColor: "transparent",
        padding: 0,
      },
    },
    "& blockquote": {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2),
      marginLeft: 0,
      fontStyle: "italic",
      color: theme.palette.text.secondary,
    },
  },
}));

const HelpArticleView = ({ article, onBack }) => {
  const classes = useStyles();

  if (!article) {
    return null;
  }

  const keywords = article.keywords
    ? article.keywords.split(",").map((k) => k.trim()).filter((k) => k)
    : [];

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <IconButton
          className={classes.backButton}
          onClick={onBack}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" className={classes.title}>
          {article.title}
        </Typography>
        {article.category && (
          <Chip
            label={article.category}
            color="primary"
            size="small"
            className={classes.categoryChip}
          />
        )}
      </div>

      {keywords.length > 0 && (
        <Box className={classes.keywordsContainer}>
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {article.summary && (
        <Typography variant="body2" color="textSecondary" paragraph>
          {article.summary}
        </Typography>
      )}

      <Paper className={classes.contentPaper}>
        <ReactMarkdown
          className={classes.markdownContent}
          remarkPlugins={[remarkGfm]}
        >
          {article.content}
        </ReactMarkdown>
      </Paper>
    </div>
  );
};

export default HelpArticleView;
