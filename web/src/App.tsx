import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardShell } from './dashboard/DashboardShell';
import { Layout } from './Layout';

// Route-level code splitting keeps recharts and AG Grid out of the first load.
const LandingPage = lazy(() => import('./landing/LandingPage'));
const AuditPage = lazy(() => import('./pages/AuditPage').then((m) => ({ default: m.AuditPage })));
const ConfirmPage = lazy(() =>
  import('./pages/ConfirmPage').then((m) => ({ default: m.ConfirmPage })),
);
const DemoPage = lazy(() => import('./pages/DemoPage').then((m) => ({ default: m.DemoPage })));
const GuardianPage = lazy(() =>
  import('./pages/GuardianPage').then((m) => ({ default: m.GuardianPage })),
);
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const PayPage = lazy(() => import('./pages/PayPage').then((m) => ({ default: m.PayPage })));
const ResultPage = lazy(() =>
  import('./pages/ResultPage').then((m) => ({ default: m.ResultPage })),
);
const SetupPage = lazy(() => import('./pages/SetupPage').then((m) => ({ default: m.SetupPage })));

function Loading() {
  return (
    <p role="status" className="p-8 text-center opacity-70">
      Loading…
    </p>
  );
}

function Senior({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </Layout>
  );
}

function Dashboard({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </DashboardShell>
  );
}

export const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path="/senior"
        element={
          <Senior>
            <HomePage />
          </Senior>
        }
      />
      <Route
        path="/senior/pay"
        element={
          <Senior>
            <PayPage />
          </Senior>
        }
      />
      <Route
        path="/senior/result/:id"
        element={
          <Senior>
            <ResultPage />
          </Senior>
        }
      />
      <Route
        path="/setup"
        element={
          <Senior>
            <SetupPage />
          </Senior>
        }
      />
      <Route
        path="/setup/confirm"
        element={
          <Senior>
            <ConfirmPage />
          </Senior>
        }
      />
      <Route
        path="/demo"
        element={
          <Suspense fallback={<Loading />}>
            <DemoPage />
          </Suspense>
        }
      />
      <Route
        path="/guardian"
        element={
          <Dashboard>
            <GuardianPage />
          </Dashboard>
        }
      />
      <Route
        path="/audit"
        element={
          <Dashboard>
            <AuditPage />
          </Dashboard>
        }
      />
      <Route
        path="*"
        element={
          <Senior>
            <HomePage />
          </Senior>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <AppRoutes />
    </BrowserRouter>
  );
}
