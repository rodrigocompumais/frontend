import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";

// Importação dinâmica para evitar erros de SSR/inicialização
let Particles = null;

const useStyles = makeStyles(() => ({
  root: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
}));

const ParticlesBackground = () => {
  const classes = useStyles();
  const [ParticlesComponent, setParticlesComponent] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Carregar o componente de partículas de forma assíncrona
    const loadParticles = async () => {
      try {
        const module = await import("react-tsparticles");
        setParticlesComponent(() => module.default);
      } catch (error) {
        console.warn("Erro ao carregar react-tsparticles:", error);
        setHasError(true);
      }
    };
    loadParticles();
  }, []);

  // Se houver erro ou ainda carregando, não renderizar nada
  if (hasError || !ParticlesComponent) {
    return <div className={classes.root} />;
  }

  return (
    <div className={classes.root}>
      <ParticlesComponent
        id="tsparticles"
        options={{
          fullScreen: { enable: false },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              onClick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 80,
                duration: 0.4,
              },
              push: {
                quantity: 2,
              },
            },
          },
          particles: {
            number: {
              value: 45,
              density: {
                enable: true,
                area: 800,
              },
            },
            color: {
              value: ["#0EA5E9", "#22C55E", "#38BDF8"],
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.5,
              random: true,
            },
            size: {
              value: 2.5,
              random: true,
            },
            links: {
              enable: true,
              distance: 140,
              color: "#22C55E",
              opacity: 0.25,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: false,
              straight: false,
              outModes: {
                default: "out",
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};

export default ParticlesBackground;


