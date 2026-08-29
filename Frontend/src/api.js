/**
 * Resolves the correct backend API URL:
 * - On local Vite dev server (port 5173): routes directly to http://localhost:8080
 * - On production / EC2 HTTPS: routes through relative /api reverse proxy
 */
export const getApiUrl = (endpoint) => {
    const isLocalVite = typeof window !== 'undefined' && 
        (window.location.port === '5173' || window.location.port === '3000');
    
    if (isLocalVite) {
        return `http://localhost:8080${endpoint}`;
    }
    return endpoint;
};
