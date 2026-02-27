import React, { createContext, useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Verificar se é primeiro acesso
  useEffect(() => {
    if (user && user.id) {
      // Verificar se o tour foi completado para este usuário
      // Usar uma chave mais persistente que não seja limpa no logout
      const tourCompleted = localStorage.getItem(`tourCompleted_${user.id}`);
      const tourCompletedGlobal = localStorage.getItem(`tourCompleted_global_${user.id}`);
      
      // Se não foi completado nem localmente nem globalmente, iniciar o tour
      if (!tourCompleted && !tourCompletedGlobal && (location.pathname === '/dashboard' || location.pathname === '/')) {
        // Pequeno delay para garantir que a página carregou
        setTimeout(() => {
          setRun(true);
        }, 1500);
      }
    }
  }, [user, location.pathname]);

  const startTour = () => {
    setStepIndex(0);
    if (location.pathname !== '/dashboard' && location.pathname !== '/') {
      history.push('/dashboard');
      setTimeout(() => {
        setRun(true);
      }, 800);
    } else {
      setRun(true);
    }
  };

  const stopTour = () => {
    setRun(false);
    if (user && user.id) {
      // Salvar em duas chaves para garantir persistência
      localStorage.setItem(`tourCompleted_${user.id}`, 'true');
      localStorage.setItem(`tourCompleted_global_${user.id}`, 'true');
    }
  };


  return (
    <TourContext.Provider
      value={{
        run,
        stepIndex,
        setStepIndex,
        startTour,
        stopTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export { TourContext };
