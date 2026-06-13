import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { Wordmark } from './components/ui/Wordmark';
import Landing from './pages/Landing';
import Reader from './pages/Reader';

/** Base layout: shell background + sticky header, page content in the outlet. */
function Layout() {
  return (
    <div className="flex min-h-full flex-col bg-shell text-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-shell/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Wordmark />
          <Link
            to="/read"
            className="rounded-card bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Start listening
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/read" element={<Reader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
