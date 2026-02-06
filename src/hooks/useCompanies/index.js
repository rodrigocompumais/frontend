import api from "../../services/api";

const useCompanies = () => {

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/companies',
            method: 'POST',
            data
        });
        return responseData;
    }

    const findAll = async (id) => {
        const { data } = await api.request({
            url: `/companies`,
            method: 'GET'
        });
        return data;
    }

    const list = async (id) => {
        const { data } = await api.request({
            url: `/companies/list`,
            method: 'GET'
        });
        return data;
    }

    const find = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'GET'
        });
        return data;
    }

    const finding = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'GET'
        });
        return data;
    }


    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const updateSchedules = async (data) => {
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}/schedules`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const getModules = async (companyId) => {
        const { data } = await api.request({
            url: `/companies/${companyId}/modules`,
            method: 'GET'
        });
        return data.modules || [];
    }

    const updateModules = async (companyId, modules) => {
        const { data } = await api.request({
            url: `/companies/${companyId}/modules`,
            method: 'PUT',
            data: { modules }
        });
        return data.modules || [];
    }

    return {
        save,
        update,
        remove,
        list,
        find,
        finding,
        findAll,
        updateSchedules,
        getModules,
        updateModules
    }
}

export default useCompanies;