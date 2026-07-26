declare global {
  interface Window {
    __ENV__?: {
      API_URL: string;
      DEMO_JWT?: string;
    };
  }
}

const getEnv = () => (typeof window !== 'undefined' ? window.__ENV__ : undefined);

export const API_URL = getEnv()?.API_URL;
export const DEMO_JWT = getEnv()?.DEMO_JWT;
