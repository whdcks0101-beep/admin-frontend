import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AuthInitializer from './common/components/AuthInitializer';

createRoot(document.getElementById('root')!).render(
    <AuthInitializer>
        <App />    
    </AuthInitializer>
)
