export interface AllQuery {
  q?: string;
  route?: string;
  platform?: string;
  tier?: string;
}

export type Route =
  | { name: 'home' }
  | { name: 'all'; query: AllQuery }
  | { name: 'repo'; id: string }
  | { name: 'compare'; ids: string[] }
  | { name: 'routes'; legacy?: boolean }
  | { name: 'method' }
  | { name: 'notfound'; path: string };

const KNOWN: Record<string, true> = { all: true, compare: true, routes: true, method: true, wecom: true };

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '').replace(/^\/+/, '');
  if (!raw) return { name: 'home' };

  const [pathPart = '', queryPart = ''] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const head = segments[0];

  if (segments.length === 0) return { name: 'home' };

  if (head === 'repo' && segments[1]) {
    return { name: 'repo', id: safeDecode(segments[1]) };
  }

  if (head === 'compare') {
    const queryIds = new URLSearchParams(queryPart).get('ids');
    const pathIds = segments[1];
    const source = queryIds ?? pathIds ?? '';
    const ids = source
      .split(',')
      .map((id) => safeDecode(id.trim()))
      .filter(Boolean)
      .slice(0, 4);
    return { name: 'compare', ids };
  }

  if (head && KNOWN[head] === true) {
    if (head === 'all') {
      const params = new URLSearchParams(queryPart);
      const query: AllQuery = {};
      const q = params.get('q');
      const route = params.get('route');
      const platform = params.get('platform');
      const tier = params.get('tier');
      if (q) query.q = safeDecode(q);
      if (route) query.route = safeDecode(route);
      if (platform) query.platform = safeDecode(platform);
      if (tier) query.tier = safeDecode(tier);
      return { name: 'all', query };
    }
    if (head === 'method') return { name: 'method' };
    if (head === 'wecom') return { name: 'routes', legacy: true };
    return { name: 'routes' };
  }

  return { name: 'notfound', path: raw };
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'all': {
      const params = new URLSearchParams();
      if (route.query.q) params.set('q', route.query.q);
      if (route.query.route) params.set('route', route.query.route);
      if (route.query.platform) params.set('platform', route.query.platform);
      if (route.query.tier) params.set('tier', route.query.tier);
      const query = params.toString();
      return query ? `#/all?${query}` : '#/all';
    }
    case 'routes':
      return '#/routes';
    case 'method':
      return '#/method';
    case 'repo':
      return `#/repo/${encodeURIComponent(route.id)}`;
    case 'compare':
      return route.ids.length > 0 ? `#/compare?ids=${route.ids.map(encodeURIComponent).join(',')}` : '#/compare';
    case 'notfound':
      return `#/${route.path}`;
    default:
      return '#/';
  }
}
