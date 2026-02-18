import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const root = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.PROD ? root : <StrictMode>{ root }</StrictMode>
);
