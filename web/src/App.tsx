import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { AuditPage } from './pages/AuditPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { DemoPage } from './pages/DemoPage';
import { GuardianPage } from './pages/GuardianPage';
import { HomePage } from './pages/HomePage';
import { PayPage } from './pages/PayPage';
import { ResultPage } from './pages/ResultPage';
import { SetupPage } from './pages/SetupPage';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/senior" element={<HomePage />} />
          <Route path="/senior/pay" element={<PayPage />} />
          <Route path="/senior/result/:id" element={<ResultPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/setup/confirm" element={<ConfirmPage />} />
          <Route path="/guardian" element={<GuardianPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
