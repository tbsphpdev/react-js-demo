import jwtDecode from 'jwt-decode';
import { verify, sign } from 'jsonwebtoken';
//
import { AuthUser } from '../@customTypes/authentication';
import axios from './axios';
import { API_BASE_URLS } from './constant';

// ----------------------------------------------------------------------

const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }
  const decoded = jwtDecode<{ exp: number }>(accessToken);
  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

const removeSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('acc');
  delete axios.defaults.headers.common.Authorization;
};

const handleTokenExpired = (exp: number) => {
  let expiredTimer;

  window.clearTimeout(expiredTimer);
  const currentTime = Date.now();
  // Take 90% of the remaining time to call refresh early and avoid collisions
  const timeLeft = Math.floor((exp * 1000 - currentTime) * 0.9);

  expiredTimer = window.setTimeout(async () => {
    try {
      const tempUser = JSON.parse(localStorage.getItem('acc') || '');
      const response = await axios.post(`${API_BASE_URLS.user}/users/refresh`, {
        username: tempUser.email,
        refreshToken: tempUser.refreshToken
      });

      const user = {
        accessToken: response.data.accessToken,
        displayName: tempUser.displayName,
        email: tempUser.email,
        logo: tempUser.logo,
        gatewayId: tempUser.gatewayId,
        refreshToken: response.data.refreshToken,
        userSub: response.data.username
      };

      setSession(user.accessToken, user);
    } catch (error) {
      console.error(error);
      removeSession();
    }
  }, timeLeft);
};

const setSession = (accessToken: string | null, user: AuthUser) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('acc', JSON.stringify(user));
    axios.defaults.headers.common.Authorization = accessToken;
    // This function below will handle when token is expired
    const { exp } = jwtDecode<{ exp: number }>(accessToken);
    handleTokenExpired(exp);
  } else {
    removeSession();
  }
};

export { isValidToken, setSession, verify, sign, removeSession };
