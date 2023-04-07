import { GatewayActionsType } from './transaction';

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUser = null | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
  gatewayactions: GatewayActionsType[];
  gatewayactionsvt: GatewayActionsType[];
};

export type JWTContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
  gatewayactions: GatewayActionsType[];
  gatewayactionsvt: GatewayActionsType[];
  method: 'jwt';
  login: (email: string, password: string) => Promise<void>;
  activate: (email: string, temporaryPassword: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
  fetchactions: (gatewayId: string) => Promise<void>;
};
