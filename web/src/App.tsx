import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { GuardianPage } from './pages/GuardianPage';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/guardian" element={<GuardianPage />} />
          <Route path="*" element={<HomeIntro />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function HomeIntro() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-bold tracking-wide text-[var(--accent)]">AEGIS</p>
      <h1 className="mt-3 text-4xl font-bold">Payments that follow your rules.</h1>
      <p className="mt-4">
        Payments made in the PayPal app itself are not checked here. Send money from AEGIS so
        Margaret&apos;s rules apply.
      </p>
    </section>
  );
}
