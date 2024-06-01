import axios from 'axios';
import Toast from '../helpers/Toast';

let tokenName = 'app-bearer';

export function getToken() {
    return localStorage.getItem(tokenName);
}


export function storeToken(newToken) {
    localStorage.setItem(tokenName, newToken);
}

export function removeToken() {
    localStorage.removeItem(tokenName);
}

let axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

axiosInstance.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export function catchError(error) {
    if (error.response) {
        if (error.response.status === 401) {
            localStorage.removeItem(tokenName);
            // verifier si le href ne contient pas les mots suivants, pour eviter une redirection infinie
            if (!window.location.href.includes('/login') && !window.location.href.includes('/verify-email/') &&
                !window.location.href.includes('/forgot-password')) {
                window.location.href = '/login';
            }
        } else {
            if (error.response.data) {
                if (error.response.data.validation) {
                    let errors = error.response.data.errors;
                    for (let key in errors) {
                        Toast.error(errors[key][0]);
                        break;
                    }
                } else if (error.response.data.message) {
                    Toast.error(error.response.data.message);
                } else {
                    Toast.error('Une erreur est survenue');
                }
            } else {
                Toast.error('Une erreur est survenue');
            }
        }
    } else {
        throw error;
    }
}

class DaoService {

    prefix = '';

    static getInstance(prefix) {
        let service = new this();
        service.setPrefix(prefix);
        return service;
    }

    setPrefix(prefix) {
        this.prefix = prefix;
        return this;
    }

    async find(idOrUid) {
        try {
            const responseData = await axiosInstance.get(`${this.prefix}/${idOrUid}`);
            return responseData.data;
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            const responseData = await axiosInstance.get(`${this.prefix}`);
            return responseData.data;
        } catch (error) {
            throw error;
        }
    }

    async create(data) {
        try {
            const responseData = await axiosInstance.post(`${this.prefix}`, data);
            return responseData.data;
        } catch (error) {
            throw error;
        }
    }

    async update(idOrUid, data) {
        try {
            const response = await axiosInstance.put(`${this.prefix}/${idOrUid}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async remove(idOrUid) {
        try {
            const response = await axiosInstance.delete(`${this.prefix}/${idOrUid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async partialUpdate(idOrUid, data) {
        try {
            const response = await axiosInstance.patch(`${this.prefix}/${idOrUid}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async upload(url, formData) {
        try {
            const response = await axiosInstance.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async download(url) {
        try {
            const response = await axiosInstance.get(url, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async get(url) {
        if (!url) {
            return null;
        }
        try {
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async post(url, data) {
        try {
            const response = await axiosInstance.post(url, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export { DaoService, axiosInstance };
