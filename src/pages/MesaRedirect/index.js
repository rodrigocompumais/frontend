import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import api from "../../services/api";

/**
 * Rota pública /mesa/:mesaId?t=TOKEN
 * Mesas independentes do formulário: chama o backend e redireciona para o cardápio correto.
 */
const MesaRedirect = () => {
  const { mesaId } = useParams();
  const { search } = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mesaId) return;
    const params = new URLSearchParams(search);
    const t = params.get("t");

    api
      .get(`/public/mesas/${mesaId}`, { params: t ? { t } : {} })
      .then(({ data }) => {
        const formSlug = data.formSlug;
        const token = t ? `&t=${encodeURIComponent(t)}` : "";
        window.location.replace(`/f/${formSlug}?mesa=${mesaId}${token}`);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Link inválido ou expirado.");
      });
  }, [mesaId, search]);

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="40vh" p={2}>
        <Typography color="error">{error}</Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
          Use o QR Code da mesa para acessar o cardápio.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="40vh">
      <CircularProgress />
      <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
        Abrindo cardápio...
      </Typography>
    </Box>
  );
};

export default MesaRedirect;
