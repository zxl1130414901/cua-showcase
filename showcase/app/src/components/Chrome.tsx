import type { Route } from '../lib/router';
import { toHash } from '../lib/router';

const NAV: { name: Route['name']; label: string; hash: string; hint: string }[] = [
  { name: 'home', label: '决策首页', hash: '#/', hint: '先看结论' },
  { name: 'all', label: '完整清单', hash: '#/all', hint: '140 个项目' },
  { name: 'routes', label: '技术路线', hash: '#/routes', hint: '5 条路线' },
  { name: 'compare', label: '项目对比', hash: '#/compare', hint: '最多 4 个' },
  { name: 'method', label: '口径说明', hash: '#/method', hint: '怎么算的' },
];

export function Header({ route }: { route: Route }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#/" aria-label="CUA 选型决策台，返回首页">
          <span className="brand__mark" aria-hidden="true">
            选
          </span>
          <span className="brand__text">
            <strong>CUA 选型决策台</strong>
            <span>140 个开源项目 · 按用途分流</span>
          </span>
        </a>
        <nav className="nav" aria-label="主导航">
          {NAV.map((item) => {
            const active = route.name === item.name;
            return (
              <a
                key={item.name}
                href={item.hash}
                className={`nav__link${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span>{item.label}</span>
                <small>{item.hint}</small>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>
          <strong>CUA 选型决策台</strong> · 离线单文件站点，数据与研究报告均来自本地文件，不联网也能看。
        </p>
        <p className="site-footer__links">
          <a href="#/method">数据口径与局限</a>
          <span aria-hidden="true">/</span>
          <a href="#/routes">技术路线</a>
          <span aria-hidden="true">/</span>
          <a href={toHash({ name: 'all', query: {} })}>完整清单</a>
        </p>
        <p className="site-footer__note">
          排名与档位是研究结论，不构成采购或上线建议；外部链接需联网才能打开。企业微信仅作为历史案例出现。
        </p>
      </div>
    </footer>
  );
}
