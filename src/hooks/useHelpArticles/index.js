import api from "../../services/api";

const useHelpArticles = () => {
    const list = async (params) => {
        const { data } = await api.request({
            url: '/help-articles',
            method: 'GET',
            params
        });
        return data;
    }

    const show = async (id) => {
        const { data } = await api.request({
            url: `/help-articles/${id}`,
            method: 'GET'
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/help-articles',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/help-articles/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/help-articles/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    return {
        list,
        show,
        save,
        update,
        remove
    }
}

export default useHelpArticles;
