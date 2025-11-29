import React, { useState, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, IconButton } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

// Imagens do carrossel
import chatImg from "../../assets/LP/caht.png";
import dashboardImg from "../../assets/LP/dashboard_black.png";
import flowbuilderImg from "../../assets/LP/flowbuilder.png";
import campanhaImg from "../../assets/LP/campanha.png";
import kanbanImg from "../../assets/LP/kanban.png";

const slides = [
  {
    image: chatImg,
    title: "Chat Multicanal",
    description: "Interface de atendimento unificada com todas as conversas em um só lugar",
  },
  {
    image: dashboardImg,
    title: "Dashboard Analítico",
    description: "Métricas em tempo real para acompanhar a performance do seu time",
  },
  {
    image: flowbuilderImg,
    title: "Flowbuilder Visual",
    description: "Crie fluxos de atendimento automatizado de forma intuitiva",
  },
  {
    image: campanhaImg,
    title: "Campanhas em Massa",
    description: "Dispare campanhas segmentadas com acompanhamento de resultados",
  },
  {
    image: kanbanImg,
    title: "CRM Kanban",
    description: "Gerencie oportunidades e acompanhe cada etapa do funil de vendas",
  },
];

const useStyles = makeStyles((theme) => ({
  carouselContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 580,
    borderRadius: 20,
    overflow: "hidden",
    background: "linear-gradient(145deg, rgba(10, 10, 15, 0.95), rgba(17, 24, 39, 0.9))",
    border: "1px solid rgba(0, 217, 255, 0.2)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 217, 255, 0.1)",
    backdropFilter: "blur(20px)",
    contain: "layout paint",
  },
  slideWrapper: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  slidesTrack: {
    display: "flex",
    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  slide: {
    minWidth: "100%",
    position: "relative",
  },
  slideImage: {
    width: "100%",
    height: "auto",
    display: "block",
    aspectRatio: "16/10",
    objectFit: "cover",
  },
  slideOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.7) 50%, transparent 100%)",
    padding: theme.spacing(3),
    paddingTop: theme.spacing(6),
  },
  slideTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "#00D9FF",
    marginBottom: theme.spacing(0.5),
    textShadow: "0 2px 10px rgba(0, 217, 255, 0.3)",
  },
  slideDescription: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 1.5,
  },
  // Navegação
  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    background: "rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    color: "#00D9FF",
    padding: 8,
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(0, 217, 255, 0.3)",
      transform: "translateY(-50%) scale(1.1)",
    },
  },
  navButtonLeft: {
    left: 12,
  },
  navButtonRight: {
    right: 12,
  },
  // Indicadores
  indicators: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    padding: theme.spacing(2),
    background: "rgba(10, 10, 15, 0.8)",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(0, 217, 255, 0.4)",
    },
  },
  indicatorActive: {
    background: "#00D9FF",
    boxShadow: "0 0 12px rgba(0, 217, 255, 0.6)",
    transform: "scale(1.2)",
  },
  // Badge
  liveBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid rgba(34, 197, 94, 0.5)",
    backdropFilter: "blur(10px)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22C55E",
    animation: "$pulse 2s infinite",
  },
  liveBadgeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#22C55E",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)",
    },
    "70%": {
      boxShadow: "0 0 0 8px rgba(34, 197, 94, 0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(34, 197, 94, 0)",
    },
  },
}));

const ImageCarousel = ({ autoSlide = true, autoSlideInterval = 4000 }) => {
  const classes = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-slide
  useEffect(() => {
    if (!autoSlide || isHovered) return;

    const interval = setInterval(goToNext, autoSlideInterval);
    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, isHovered, goToNext]);

  return (
    <Box
      className={classes.carouselContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      <Box className={classes.liveBadge}>
        <Box className={classes.liveDot} />
        <Typography className={classes.liveBadgeText}>Preview</Typography>
      </Box>

      {/* Slides */}
      <Box className={classes.slideWrapper}>
        <Box
          className={classes.slidesTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <Box key={index} className={classes.slide}>
              <img
                src={slide.image}
                alt={slide.title}
                className={classes.slideImage}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <Box className={classes.slideOverlay}>
                <Typography className={classes.slideTitle}>
                  {slide.title}
                </Typography>
                <Typography className={classes.slideDescription}>
                  {slide.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Navegação */}
      <IconButton
        className={`${classes.navButton} ${classes.navButtonLeft}`}
        onClick={goToPrev}
        aria-label="Slide anterior"
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        className={`${classes.navButton} ${classes.navButtonRight}`}
        onClick={goToNext}
        aria-label="Próximo slide"
      >
        <ChevronRightIcon />
      </IconButton>

      {/* Indicadores */}
      <Box className={classes.indicators}>
        {slides.map((_, index) => (
          <Box
            key={index}
            className={`${classes.indicator} ${
              index === currentIndex ? classes.indicatorActive : ""
            }`}
            onClick={() => goToSlide(index)}
            role="button"
            aria-label={`Ir para slide ${index + 1}`}
            tabIndex={0}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ImageCarousel;

