import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ThemedApp from './pages/ThemedApp';

const baseUrl = window.location.pathname.indexOf("/app/") === -1 ? 
                "/" :
                window.location.pathname.substring(0, window.location.pathname.indexOf("/app/") + "/app/".length);
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
<BrowserRouter basename={baseUrl}>
    <ThemedApp />
  </BrowserRouter>);
