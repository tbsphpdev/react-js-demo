import axios from 'axios';

// ----------------------------------------------------------------------

const publicAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

publicAxiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    if (error?.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      return publicAxiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default publicAxiosInstance;
