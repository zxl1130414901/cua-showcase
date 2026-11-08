import type { ReactNode } from 'react';
import { TIER_ICON, tierKey, routeLabel, riskTone, typeLabel, type Tone } from '../lib/format';

const TONE_ICON: Record<Tone, string> = {
  ok: '✓',
  warn: '!',
  bad: '×',
  muted: '·',
};

const TONE_TEXT: Record<Tone, string> = {
  ok: '可接受',
  warn: '需谨慎',
  bad: '不建议',
  muted: '信息',
};

export function RiskChip({ text, tone }: { text: string; tone?: Tone }) {
  const resolved = tone ?? riskTone(text);
  return (
    <span className={`chip chip--${resolved}`} data-tone={resolved}>
      <span className="chip__icon" aria-hidden="true">
        {TONE_ICON[resolved]}
      </span>
      <span className="sr-only">{TONE_TEXT[resolved]}：</span>
      {text}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  return <span className="tag tag--neutral">{typeLabel(type)}</span>;
}

/** 推荐等级：图标 + 文字同时出现；「勿用」额外附一行文字警示 */
export function TierBadge({
  tier,
  showNote = false,
}: {
  tier?: string | null;
  showNote?: boolean;
}) {
  const key = tierKey(tier);
  if (!tier || !key) return null;
  return (
    <span className={`tier-badge tier-badge--${key}`} data-tier={tier}>
      <span className="tier-badge__icon" aria-hidden="true">
        {TIER_ICON[tier] ?? '·'}
      </span>
      <span className="sr-only">推荐等级：</span>
      {tier}
      {tier === '勿用' && showNote ? (
        <span className="tier-badge__note">（有封禁风险）</span>
      ) : null}
    </span>
  );
}

export function RouteTag({ route }: { route?: string | null }) {
  const label = routeLabel(route);
  if (!label) return null;
  return (
    <span className="route-tag" title="落地路线">
      {label}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  const display = value >= 10000 ? `${(value / 10000).toFixed(1)} 万` : value.toLocaleString('en-US');
  return (
    <span className="stars" aria-label={`GitHub 星标 ${value}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="icon icon--star">
        <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .8 4.3L8 11.4l-3.9 2 .8-4.3-3.1-3 4.3-.6z" />
      </svg>
      {display}
    </span>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value * 10));
  return (
    <div className="score">
      <div className="score__head">
        <span>{label}</span>
        <strong>{value === null ? '未整理' : `${value}/10`}</strong>
      </div>
      <div className="score__track">
        <div className="score__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Section({
  id,
  index,
  title,
  lead,
  children,
  actions,
}: {
  id?: string;
  index?: number;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="section" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="section__head">
        <div>
          {index !== undefined ? (
            <span className="section__index" aria-hidden="true">
              {String(index).padStart(2, '0')}
            </span>
          ) : null}
          <h2 className="section__title" id={id ? `${id}-title` : undefined}>
            {title}
          </h2>
          {lead ? <p className="section__lead">{lead}</p> : null}
        </div>
        {actions ? <div className="section__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function ExternalLink({
  href,
  children,
  className = 'link',
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
    >
      {children}
      <svg viewBox="0 0 16 16" aria-hidden="true" className="icon icon--external">
        <path d="M6 3h7v7M13 3L5 11M11 9v4H3V5h4" />
      </svg>
    </a>
  );
}

export function EmptyDetail({ children }: { children: ReactNode }) {
  return (
    <div className="notice notice--warn">
      <span className="notice__icon" aria-hidden="true">
        !
      </span>
      <div>{children}</div>
    </div>
  );
}
