import { useEffect, useState } from 'react';
import { Header, Footer } from './components/Chrome';
import { parseHash, type AllQuery, type Route } from './lib/router';
import { HomePage } from './pages/HomePage';
import { AllPage } from './pages/AllPage';
import { RepoPage } from './pages/RepoPage';
import { ComparePage } from './pages/ComparePage';
import { RoutesPage } from './pages/RoutesPage';
import { MethodPage } from './pages/MethodPage';
import { NotFoundPage } from './pages/NotFoundPage';

function readRoute(): { hash: string; route: Route } {
  const hash = window.location.hash || '#/';
  return { hash, route: parseHash(hash) };
}

export function App() {
  const [state, setState] = useState(readRoute);

  useEffect(() => {
    const onChange = () => setState(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  useEffect(() => {
    // 旧的 #/wecom 链接重定向到 #/routes
    if (window.location.hash === '#/wecom') {
      window.location.replace('#/routes');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [state.hash]);

  const { route } = state;
  const allQuery: AllQuery = route.name === 'all' ? route.query : {};

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <Header route={route} />
      <main id="main" className="site-main" tabIndex={-1}>
        {route.name === 'home' ? <HomePage /> : null}
        {route.name === 'all' ? <AllPage key={state.hash} initial={allQuery} /> : null}
        {route.name === 'repo' ? <RepoPage id={route.id} /> : null}
        {route.name === 'compare' ? <ComparePage ids={route.ids} /> : null}
        {route.name === 'routes' ? <RoutesPage /> : null}
        {route.name === 'method' ? <MethodPage /> : null}
        {route.name === 'notfound' ? <NotFoundPage path={route.path} /> : null}
      </main>
      <Footer />
    </div>
  );
}
