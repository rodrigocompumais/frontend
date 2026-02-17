import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import PublicMenuForm from "../Forms/PublicMenuForm";

/**
 * Cardápio por link da mesa (/mesa/:mesaId/cardapio?t=TOKEN).
 * Mesas não dependem de formulário: exibe o cardápio da empresa e nome/contato para ocupar.
 */
const MesaCardapio = () => {
  const { mesaId } = useParams();
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [products, setProducts] = useState([]);
  const [mesaData, setMesaData] = useState(null);
  const [orderToken, setOrderToken] = useState(null);

  useEffect(() => {
    if (!mesaId) return;
    const params = new URLSearchParams(search);
    const t = params.get("t");

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: mesaRes } = await api.get(`/public/mesas/${mesaId}`, { params: t ? { t } : {} });
        const formPublicId = mesaRes.formPublicId;
        if (!formPublicId) {
          setError("Configure um formulário de cardápio na empresa para usar o link da mesa.");
          return;
        }

        const [formData, productsData] = await Promise.all([
          api.get(`/public/forms/${formPublicId}`).then((r) => r.data),
          api.get(`/public/mesas/${mesaId}/products`, { params: t ? { t } : {} }).then((r) => r.data),
        ]);

        setForm(formData);
        setProducts(productsData.products || []);
        setMesaData(mesaRes.mesa);
        setOrderToken(mesaRes.orderToken || null);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Link inválido ou expirado.";
        setError(msg);
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [mesaId, search]);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" p={2}>
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
          Carregando cardápio...
        </Typography>
      </Box>
    );
  }

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

  if (!form) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="40vh" p={2}>
        <Typography color="textSecondary">Cardápio não configurado para esta mesa.</Typography>
      </Box>
    );
  }

  return (
    <PublicMenuForm
      form={form}
      slug={form.publicId}
      initialProducts={products}
      initialMesaFromQR={mesaData}
      initialOrderToken={orderToken}
      initialMesaValue={mesaData ? String(mesaData.id) : ""}
    />
  );
};

export default MesaCardapio;
