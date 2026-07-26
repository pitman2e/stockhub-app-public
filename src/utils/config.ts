declare global {
  interface Window {
    __ENV__?: {
      API_URL: string;
      DEMO_JWT?: string;
    };
  }
}

export const API_URL = window.__ENV__?.API_URL;
export const DEMO_JWT = window.__ENV__?.DEMO_JWT;
