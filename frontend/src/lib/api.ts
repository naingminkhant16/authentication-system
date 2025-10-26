import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:5000',
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired (401) and not retried yet
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshing
        ) {
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to get a new access token
                const refreshRes = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/refresh-token`,
                    {},
                    {withCredentials: true}
                );

                const newToken = refreshRes.data.data.access_token;
                localStorage.setItem("access_token", newToken);

                // Update the Authorization header and retry the original request
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token invalid — clear tokens and redirect to login
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                isRefreshing = false;
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;