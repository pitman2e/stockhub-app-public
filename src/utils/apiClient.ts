import axios from 'axios';
import { API_URL, DEMO_JWT } from './config';
import { jwtDecode } from 'jwt-decode';
import { getAuth } from 'firebase/auth';

const {
  VITE_API_URL,
  VITE_DEMO_JWT
} = import.meta.env;

let token: string | null | undefined = undefined;

export const setToken = (newToken: string | null | undefined) => {
  token = newToken;
};

export const apiClient = axios.create({
  baseURL: API_URL || VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isDemoMode = () => {
  return !!(DEMO_JWT || VITE_DEMO_JWT);
}

export const getToken = (): string => {
  const demoJwt = DEMO_JWT || VITE_DEMO_JWT;
  const rtvToken = demoJwt || token;
  return rtvToken;
};

export const getJwtSub = (): string | undefined => {
  const demoJwt = DEMO_JWT || VITE_DEMO_JWT;
  const rtvToken = demoJwt || token;
  if (!rtvToken) {
    return undefined;
  }
  const decoded = jwtDecode<{ sub: string }>(rtvToken);
  return decoded.sub;
}

apiClient.interceptors.request.use(async (config) => {
  const demoJwt = DEMO_JWT || VITE_DEMO_JWT;

  if (demoJwt) {
    config.headers.Authorization = `Bearer ${demoJwt}`;
    return config;
  }

  const currentUser = getAuth().currentUser;
  const activeToken = currentUser ? await currentUser.getIdToken() : token;

  if (activeToken) {
    config.headers.Authorization = `Bearer ${activeToken}`;
    token = activeToken;
  }

  return config;
});