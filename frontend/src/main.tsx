import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './styles.css';
import { AuthProvider } from './features/auth/AuthProvider';
import { AuthGate, CutsGate, HomeRedirect } from './app/App';
import { Shell } from './app/Shell';
import { CutListPage } from './features/cuts/CutListPage';
import { CutFormPage } from './features/cuts/CutFormPage';
import { CutDetailPage } from './features/cuts/CutDetailPage';
import { EmptyState } from './components/ui';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } });
const router = createBrowserRouter([{
  element: <AuthGate />,
  children: [{ element: <Shell />, children: [{ element: <CutsGate />, children: [
    { index: true, element: <HomeRedirect /> },
    { path: 'cuts', element: <CutListPage /> },
    { path: 'cuts/new', element: <CutFormPage /> },
    { path: 'cuts/:id', element: <CutDetailPage /> },
    { path: 'cuts/:id/edit', element: <CutFormPage /> },
    { path: '*', element: <EmptyState title="Página no encontrada" /> },
  ] }] }],
}]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><AuthProvider><RouterProvider router={router} /></AuthProvider></QueryClientProvider></React.StrictMode>,
);
