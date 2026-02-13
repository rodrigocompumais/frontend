import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Paper, Typography, Modal, IconButton, Tabs, Tab, Chip, Box } from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";
import useHelpArticles from "../../hooks/useHelpArticles";
import HelpArticleSearch from "../../components/HelpArticleSearch";
import HelpArticleView from "../../components/HelpArticleView";

const useStyles = makeStyles(theme => ({
  mainPaperContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  mainPaper: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: theme.spacing(3),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  helpPaper: {
    position: 'relative',
    width: '100%',
    minHeight: '340px',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '340px',
  },
  paperHover: {
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: `0 0 8px`,
      color: theme.palette.primary.main,
    },
  },
  videoThumbnail: {
    width: '100%',
    height: 'calc(100% - 56px)',
    objectFit: 'cover',
    borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0`,
  },
  videoTitle: {
    marginTop: theme.spacing(1),
    flex: 1,
  },
  videoDescription: {
    maxHeight: '100px',
    overflow: 'hidden',
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1024,
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
  tabsContainer: {
    marginBottom: theme.spacing(2),
  },
  articleCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  articleTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  articleSummary: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  articleMeta: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [records, setRecords] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchParam, setSearchParam] = useState("");
  const [category, setCategory] = useState("");
  const { list } = useHelps();
  const { list: listArticles, show: showArticle } = useHelpArticles();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      async function fetchArticles() {
        try {
          const data = await listArticles({
            searchParam,
            category: category || undefined,
          });
          setArticles(data.records || []);
        } catch (err) {
          console.error("Erro ao buscar artigos:", err);
        }
      }
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, searchParam, category]);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedArticle(null);
  };

  const handleArticleClick = async (articleId) => {
    try {
      const article = await showArticle(articleId);
      setSelectedArticle(article);
    } catch (err) {
      console.error("Erro ao buscar artigo:", err);
    }
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
  };

  const renderVideos = () => {
    return (
      <>
        <div className={`${classes.mainPaper} ${classes.mainPaperContainer}`}>
          {records.length ? records.map((record, key) => (
            <Paper key={key} className={`${classes.helpPaper} ${classes.paperHover}`} onClick={() => openVideoModal(record.video)}>
              <img
                src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                alt="Thumbnail"
                className={classes.videoThumbnail}
              />
              <Typography variant="button" className={classes.videoTitle}>
                {record.title}
              </Typography>
              <Typography variant="caption" className={classes.videoDescription}>
                {record.description}
              </Typography>
            </Paper>
          )) : (
            <Typography className={classes.emptyState}>
              Nenhum vídeo disponível
            </Typography>
          )}
        </div>
      </>
    );
  };

  const renderArticles = () => {
    if (selectedArticle) {
      return <HelpArticleView article={selectedArticle} onBack={handleBackToArticles} />;
    }

    return (
      <>
        <HelpArticleSearch
          onSearch={setSearchParam}
          onCategoryChange={setCategory}
        />
        <div className={classes.mainPaperContainer}>
          {articles.length > 0 ? (
            articles.map((article) => (
              <Paper
                key={article.id}
                className={classes.articleCard}
                onClick={() => handleArticleClick(article.id)}
              >
                <Typography variant="h6" className={classes.articleTitle}>
                  {article.title}
                </Typography>
                {article.summary && (
                  <Typography variant="body2" className={classes.articleSummary}>
                    {article.summary}
                  </Typography>
                )}
                <Box className={classes.articleMeta}>
                  {article.category && (
                    <Chip label={article.category} size="small" color="primary" />
                  )}
                  {article.keywords && article.keywords.split(",").slice(0, 3).map((keyword, idx) => (
                    <Chip
                      key={idx}
                      label={keyword.trim()}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            ))
          ) : (
            <Typography className={classes.emptyState}>
              Nenhum artigo encontrado
            </Typography>
          )}
        </div>
      </>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          {i18n.t("helps.title")} ({tabValue === 0 ? records.length : articles.length})
        </Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        className={classes.tabsContainer}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Vídeos" />
        <Tab label="Artigos" />
      </Tabs>
      {tabValue === 0 && renderVideos()}
      {tabValue === 1 && renderArticles()}
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;