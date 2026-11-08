export function NotFoundPage({ path }: { path: string }) {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">页面不存在</p>
        <h1>这个地址没有内容</h1>
        <p className="page-head__lead">
          你访问的是 <code>#{path}</code>，可能链接有误或项目已从清单中移除。
        </p>
      </header>
      <p className="hero__actions">
        <a className="button button--primary" href="#/">
          回到决策首页
        </a>
        <a className="button button--ghost" href="#/all">
          看完整清单
        </a>
      </p>
    </div>
  );
}
