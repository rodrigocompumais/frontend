import { useCallback } from "react";
import api, { openApi } from "../../services/api";

const LIST_PLAN_CACHE_TTL_MS = 120000; // 2 min - evita dezenas de requisições ao carregar
const listPlanCache = new Map();

const usePlans = () => {
    const getPlanList = useCallback(async (params) => {
        const { data } = await openApi.request({
            url: '/plans/list',
            method: 'GET',
            params
        });
        return data;
    }, []);

    const list = useCallback(async (params) => {
        const { data } = await api.request({
            url: '/plans/all',
            method: 'GET',
            params
        });
        return data;
    }, []);

    const finder = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'GET'
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/plans',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/plans/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const getPlanCompany = useCallback(async (params, id) => {
        const companyId = String(id ?? "");
        const now = Date.now();
        const cached = listPlanCache.get(companyId);
        if (cached && cached.expiresAt > now) return cached.data;
        const { data } = await api.request({
            url: `/companies/listPlan/${id}`,
            method: 'GET',
            params
        });
        listPlanCache.set(companyId, { data, expiresAt: now + LIST_PLAN_CACHE_TTL_MS });
        if (listPlanCache.size > 50) {
            for (const [k, v] of listPlanCache.entries()) {
                if (v.expiresAt <= now) listPlanCache.delete(k);
            }
        }
        return data;
    }, []);

    return {
        getPlanList,
        list,
        save,
        update,
        finder,
        remove,
        getPlanCompany
    }
}

export default usePlans;