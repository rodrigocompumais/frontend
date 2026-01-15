import { useMemo } from "react";
import { useContext } from "react";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";

/**
 * Hook para verificar se o usuário está no período de teste
 * Retorna informações sobre o período de teste incluindo dias restantes
 * 
 * Valida se:
 * - Conta foi criada há menos de 7 dias OU
 * - Tem 7 dias ou menos para o vencimento
 */
const useTrialPeriod = () => {
  const { user } = useContext(AuthContext);

  const trialInfo = useMemo(() => {
    if (!user?.company?.dueDate) {
      return {
        isInTrialPeriod: false,
        daysLeft: 0,
        daysUntilExpiry: 0,
        isExpired: true,
        createdAt: null,
        dueDate: null,
      };
    }

    const dueDate = moment(user.company.dueDate);
    const createdAt = user.company.createdAt ? moment(user.company.createdAt) : null;
    const today = moment().startOf("day");
    
    // Dias até o vencimento
    const daysUntilExpiry = dueDate.diff(today, "days");
    const isExpired = today.isAfter(dueDate);

    // Verificar se conta foi criada há menos de 7 dias
    const daysSinceCreation = createdAt ? today.diff(createdAt.startOf("day"), "days") : null;
    const isRecentlyCreated = createdAt && daysSinceCreation <= 7;

    // Verificar se tem 7 dias ou menos para vencer
    const isNearExpiry = !isExpired && daysUntilExpiry <= 7;

    // Está no período de teste se:
    // 1. Foi criada há menos de 7 dias OU
    // 2. Tem 7 dias ou menos para vencer
    const isInTrialPeriod = isRecentlyCreated || isNearExpiry;

    return {
      isInTrialPeriod,
      daysLeft: Math.max(0, daysUntilExpiry),
      daysUntilExpiry,
      daysSinceCreation,
      isExpired,
      createdAt: createdAt ? createdAt.toDate() : null,
      dueDate: dueDate.toDate(),
      isRecentlyCreated,
      isNearExpiry,
    };
  }, [user?.company?.dueDate, user?.company?.createdAt]);

  return trialInfo;
};

export default useTrialPeriod;
