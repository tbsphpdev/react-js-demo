import { createContext, ReactNode, useEffect, useReducer } from 'react';
// utils
import { API_BASE_URLS } from 'utils/constant';
import { GatewayActionsType } from '@customTypes/transaction';
import axios from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';
// @types
import { ActionMap, AuthState, AuthUser, JWTContextType } from '../@customTypes/authentication';

// ----------------------------------------------------------------------

enum Types {
  Initial = 'INITIALIZE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  Register = 'REGISTER',
  GatewayActionFetch = 'GATEWAYACTIONFETCH'
}

type JWTAuthPayload = {
  [Types.Initial]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [Types.Login]: {
    user: AuthUser;
  };
  [Types.Logout]: undefined;
  [Types.Register]: {
    user: AuthUser;
  };
  [Types.GatewayActionFetch]: {
    gatewayactions: GatewayActionsType[];
    gatewayactionsvt: GatewayActionsType[];
  };
};

type CreateSessionType = {
  accessToken: string;
  name: string;
  familyName: string;
  idToken: string;
  refreshToken: string;
  username: string;
  logo: string;
  email: string;
  gatewayId: string;
  role: string;
};

export type JWTActions = ActionMap<JWTAuthPayload>[keyof ActionMap<JWTAuthPayload>];

const getRoleName = (roleName: string) => {
  switch (roleName?.toLowerCase()) {
    case 'madmin':
      return 'Merchant Admin';

    case 'musers':
      return 'User';

    default:
      return '';
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  gatewayactions: [],
  gatewayactionsvt: []
};

const JWTReducer = (state: AuthState, action: JWTActions) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null
      };

    case 'REGISTER':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user
      };

    case 'GATEWAYACTIONFETCH':
      return {
        ...state,
        gatewayactions: [...action.payload.gatewayactions],
        gatewayactionsvt: [...action.payload.gatewayactionsvt]
      };

    default:
      return state;
  }
};

const AuthContext = createContext<JWTContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(JWTReducer, initialState);
  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        const user = window.localStorage.getItem('acc');

        if (accessToken && user && isValidToken(accessToken)) {
          setSession(accessToken, JSON.parse(user));

          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: true,
              user: JSON.parse(user)
            }
          });
        } else {
          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: Types.Initial,
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    };

    // CALL this API to fetch account details on login for roles, elements etc
    initialize();
  }, []);

  const createSession = ({
    accessToken,
    name,
    familyName,
    idToken,
    refreshToken,
    username,
    logo,
    email,
    gatewayId,
    role
  }: CreateSessionType) => {
    const user = {
      accessToken,
      email,
      idToken,
      refreshToken,
      logo,
      gatewayId,
      role,
      displayName: `${name} ${familyName}`,
      userSub: username
    };

    setSession(accessToken, user);
    dispatch({
      type: Types.Login,
      payload: {
        user
      }
    });
    fetchactions(gatewayId);
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URLS.user}/users/login`, {
      username: email,
      password
    });
    const {
      accessToken,
      name,
      familyName,
      idToken,
      refreshToken,
      username,
      logo,
      gatewayId,
      email: userEmail,
      roles
    } = response.data.message;

    const role = getRoleName(roles?.roleName);

    createSession({
      accessToken,
      name,
      familyName,
      idToken,
      refreshToken,
      username,
      logo,
      email: userEmail,
      gatewayId,
      role
    });
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await axios.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName
    });
    const { accessToken, user } = response.data.message;

    window.localStorage.setItem('accessToken', accessToken);
    dispatch({
      type: Types.Register,
      payload: {
        user
      }
    });
  };

  const activate = async (email: string, temporaryPassword: string, password: string) => {
    await logout();
    const url = `${process.env.REACT_APP_API_URL_ADMIN}/${API_BASE_URLS.activateUser}/admin/users/activate`;

    const response = await axios.post(url, {
      username: email,
      oldPassword: temporaryPassword,
      newPassword: password
    });

    const {
      accessToken,
      name,
      familyName,
      idToken,
      refreshToken,
      username,
      profile,
      logo,
      gatewayId,
      roles,
      email: userEmail
    } = response.data.message;
    const role = getRoleName(roles?.roleName);

    if (profile === 'Merchant') {
      createSession({
        accessToken,
        name,
        familyName,
        idToken,
        refreshToken,
        username,
        logo,
        email: userEmail,
        gatewayId,
        role
      });
    }
  };

  const logout = async () => {
    setSession(null, null);
    dispatch({ type: Types.Logout });
  };

  const resetPassword = async (email: string) => {
    await axios.post(`${API_BASE_URLS.user}/users/password/forget`, {
      username: email
    });
  };

  const updateProfile = () => {};

  const fetchactions = async (gatewayId: string) => {
    try {
      const url = `${API_BASE_URLS.adminGateway}/gateways/actions/${gatewayId}/paylink`;
      const url1 = `${API_BASE_URLS.adminGateway}/gateways/actions/${gatewayId}/vt`;
      const [response, response1] = await Promise.all([axios.get(url), axios.get(url1)]);
      if (response.data && response1.data) {
        dispatch({
          type: Types.GatewayActionFetch,
          payload: {
            gatewayactions: [...response.data.message],
            gatewayactionsvt: [...response1.data.message]
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        activate,
        fetchactions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
