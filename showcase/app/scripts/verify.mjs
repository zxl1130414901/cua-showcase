#!/usr/bin/env node
/**
 * 用 Playwright + 本地 Edge 打开 file:// 产物做实测（通用 CUA 口径）：
 * - 控制台错误 / 页面异常
 * - 四档宽度的横向溢出
 * - rankCount 140、首页 Top10 与 cua_rank.json 一致
 * - 清单 140 行、tier 徽章与「勿用」文字警示、自然语言搜索
 * - 详情 13 分区、无企业微信评分分区、历史折叠存在
 * - 技术路线页 5 条路线、旧 #/wecom 重定向
 * - 截图输出到 showcase/shots
 */
import { chromium } from 'playwright-core';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOWCASE = resolve(__dirname, '..', '..');
const DIST = join(SHOWCASE, 'app', 'dist', 'index.html');
const SHOTS = join(SHOWCASE, 'shots');
const data = JSON.parse(readFileSync(join(SHOWCASE, 'app', 'src', 'data', 'generated.json'), 'utf8'));

const rankPath = join(SHOWCASE, 'data', 'cua_rank.json');
const rankData = existsSync(rankPath) ? JSON.parse(readFileSync(rankPath, 'utf8')) : null;
const rankItems = (rankData?.items ?? []).slice().sort((a, b) => a.rank - b.rank);
const expectedTop10 = rankItems.slice(0, 10).map((item) => item.id);
const rankById = new Map(rankItems.map((item) => [item.id, item]));

mkdirSync(SHOTS, { recursive: true });

const started = Date.now();
const log = (message) => console.log(`[实测] ${message}（${Date.now() - started} ms）`);

const base = pathToFileURL(DIST).href;
const rankedWithDetail = rankItems
  .map((item) => data.repos.find((repo) => repo.id === item.id))
  .filter((repo) => repo && repo.hasDetail);
const detailRepo = rankedWithDetail[0] ?? data.repos.find((repo) => repo.hasDetail) ?? data.repos[0];
const legacyRepo = data.repos.find((repo) => repo.wecomUseZh) ?? detailRepo;
const compareRepos = (rankedWithDetail.length >= 3
  ? rankedWithDetail.slice(0, 3)
  : data.repos.filter((repo) => repo.hasDetail).slice(0, 3));

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = {
  consoleErrors: [],
  pageErrors: [],
  overflow: {},
  counts: {},
  firstScreen: {},
  shots: [],
};
results.counts.rankCount = data.meta.rankCount;
results.counts.rankFileItems = rankItems.length;
results.counts.detailCount = data.meta.detailCount;
results.counts.missingDetailCount = data.meta.missingDetailCount;
results.counts.tierCounts = data.meta.tierCounts;
results.counts.routeCount = data.cua.routes.length;

async function openPage(hash, width, height = 1000) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push({ hash, message: msg.text() });
  });
  page.on('pageerror', (error) => results.pageErrors.push({ hash, message: String(error) }));
  await page.goto(`${base}${hash}`, { waitUntil: 'load' });
  await page.waitForTimeout(350);
  return { page, context };
}

const overflowOf = (page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    ok: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  }));

// 四档宽度 + 首页首屏
for (const [width, height] of [
  [375, 812],
  [768, 900],
  [1024, 900],
  [1440, 900],
]) {
  const { page, context } = await openPage('#/', width, height);
  results.overflow[width] = await overflowOf(page);
  if (width === 1440 || width === 375) {
    results.firstScreen[width] = await page.evaluate(() => {
      const title = document.querySelector('.hero__title');
      const usecases = document.querySelector('.usecases');
      const fact = document.querySelector('.fact');
      const rect = title?.getBoundingClientRect();
      return {
        conclusionVisible: Boolean(rect && rect.top < window.innerHeight && rect.bottom > 0),
        conclusionText: title?.textContent?.replace(/\s+/g, '') ?? '',
        usecasesVisible: Boolean(usecases && usecases.getBoundingClientRect().top < window.innerHeight),
        usecaseCount: document.querySelectorAll('.usecase').length,
        firstFactVisible: Boolean(fact && fact.getBoundingClientRect().top < window.innerHeight),
      };
    });
    await page.screenshot({ path: join(SHOTS, `home-${width}.png`), fullPage: false });
    results.shots.push(`home-${width}.png`);
    await page.screenshot({ path: join(SHOTS, `home-${width}-full.png`), fullPage: true });
    results.shots.push(`home-${width}-full.png`);
    if (width === 1440) {
      const ids = await page.$$eval('.cards .card', (cards) =>
        cards.map((card) => decodeURIComponent((card.getAttribute('href') ?? '').replace('#/repo/', ''))),
      );
      results.counts.homeTop10 = ids;
      results.counts.homeTop10MatchesRankFile = JSON.stringify(ids) === JSON.stringify(expectedTop10);
      results.counts.homeTierBadges = await page.locator('.cards .tier-badge').count();
      results.counts.homeRiskLines = await page.locator('.cards .card__risk').count();
      results.counts.homeHasWecomScoreWording = (await page.locator('body').innerText()).includes('适配度');
    }
  }
  await context.close();
}

// 完整清单
{
  const { page, context } = await openPage('#/all', 1440);
  results.counts.allRows = await page.locator('.table--all tbody tr').count();
  results.counts.allSortableHeaders = await page.locator('.table--all thead th').count();
  results.counts.firstRowId = await page
    .locator('.table--all tbody tr')
    .first()
    .locator('.project-link')
    .evaluate((el) => decodeURIComponent((el.getAttribute('href') ?? '').replace('#/repo/', '')));
  results.counts.firstRowIsRank1 = results.counts.firstRowId === expectedTop10[0];

  // 自然语言搜索
  await page.fill('#all-search', '我想自动填表并提交');
  await page.waitForTimeout(250);
  results.counts.searchNaturalRows = await page.locator('.table--all tbody tr').count();

  await page.fill('#all-search', '');
  await page.waitForTimeout(200);

  // 推荐等级：全部徽章、「勿用」筛选与文字警示
  results.counts.tierBadges = await page.locator('.table--all .tier-badge').count();
  results.counts.tierFilterChips = await page
    .locator('.filters__row [id="filter-tier"] + .filters__chips .filter-chip')
    .count();
  results.counts.banRows = await page.evaluate(
    () => document.querySelectorAll('.table--all .tier-badge--ban').length,
  );
  await page.getByRole('button', { name: /勿用/ }).click();
  await page.waitForTimeout(250);
  results.counts.banFilterRows = await page.locator('.table--all tbody tr').count();
  results.counts.banWarningText = await page
    .locator('.table--all .tier-badge--ban .tier-badge__note')
    .first()
    .innerText();
  await page.getByRole('button', { name: '重置全部' }).click();
  await page.waitForTimeout(200);

  // 路线筛选
  await page.locator('[id="filter-route"] + .filters__chips .filter-chip').first().click();
  await page.waitForTimeout(200);
  results.counts.routeFilterRows = await page.locator('.table--all tbody tr').count();
  await page.getByRole('button', { name: '重置全部' }).click();
  await page.waitForTimeout(200);

  results.overflow.all1440 = await overflowOf(page);
  results.counts.allHasWecomScoreWording = (await page.locator('body').innerText()).includes('适配度');

  await page.screenshot({ path: join(SHOTS, 'all-1440.png'), fullPage: false });
  results.shots.push('all-1440.png');
  await context.close();
}

// 清单 375
{
  const { page, context } = await openPage('#/all', 375);
  results.overflow.all375 = await overflowOf(page);
  await page.screenshot({ path: join(SHOTS, 'all-375.png'), fullPage: false });
  results.shots.push('all-375.png');
  await context.close();
}

// 详情页
{
  const { page, context } = await openPage(`#/repo/${encodeURIComponent(detailRepo.id)}`, 1440);
  results.counts.detailSections = await page.locator('.page--repo .section').count();
  results.counts.detailTitle = await page.locator('.repo-head h1').innerText();
  results.counts.detailRepo = detailRepo.name;
  results.counts.detailRankLine = await page.locator('.relation-rank strong').first().innerText();
  results.counts.detailRankExpected = rankById.get(detailRepo.id)?.rank ?? null;
  results.counts.detailSteps = await page.locator('#steps .ordered li').count();
  results.counts.detailStepsExpected = detailRepo.stepsZh.length;
  results.counts.detailSuccessChars = (await page.locator('#success p').first().innerText()).length;
  results.counts.detailSuccessExpectedChars = detailRepo.successRateZh.length;
  results.counts.detailHasFit = (await page.locator('#fit').count()) === 1;
  results.counts.detailHasWecomSection = (await page.locator('#wecom').count()) > 0;
  results.counts.detailFitTitles = await page.locator('#fit .fit-block__title').allInnerTexts();
  results.counts.detailSubscores = await page.locator('#fit .subscore').count();
  results.overflow.repo1440 = await overflowOf(page);
  await page.screenshot({ path: join(SHOTS, 'repo-1440.png'), fullPage: false });
  results.shots.push('repo-1440.png');
  await page.screenshot({ path: join(SHOTS, 'repo-1440-full.png'), fullPage: true });
  results.shots.push('repo-1440-full.png');
  await context.close();
}

// 详情页 375
{
  const { page, context } = await openPage(`#/repo/${encodeURIComponent(detailRepo.id)}`, 375);
  results.overflow.repo375 = await overflowOf(page);
  await page.screenshot({ path: join(SHOTS, 'repo-375.png'), fullPage: false });
  results.shots.push('repo-375.png');
  await context.close();
}

// 历史案例折叠
{
  const { page, context } = await openPage(`#/repo/${encodeURIComponent(legacyRepo.id)}`, 1440);
  results.counts.legacyCaseExists = (await page.locator('details.legacy-case').count()) === 1;
  results.counts.legacyCaseClosedByDefault = await page
    .locator('details.legacy-case')
    .evaluate((el) => !el.open);
  await context.close();
}

// 对比页
{
  const ids = compareRepos.map((repo) => encodeURIComponent(repo.id)).join(',');
  const { page, context } = await openPage(`#/compare?ids=${ids}`, 1440);
  results.counts.compareColumns = await page.locator('.table--compare thead th').count();
  results.counts.compareRows = await page.locator('.table--compare tbody tr').count();
  results.counts.compareDiffRows = await page.locator('.table--compare tbody tr.is-diff').count();
  results.overflow.compare1440 = await overflowOf(page);
  await page.screenshot({ path: join(SHOTS, 'compare-1440.png'), fullPage: false });
  results.shots.push('compare-1440.png');
  await context.close();
}

// 技术路线页
{
  const { page, context } = await openPage('#/routes', 1440);
  results.counts.routeRows = await page.locator('.table--routes tbody tr').count();
  results.counts.routeExtraCards = await page.locator('.route-extra__item').count();
  results.counts.decisionRows = await page.locator('.decisions li').count();
  results.counts.tierMeaningItems = await page.locator('.tier-meanings__item').count();
  results.counts.routeCaseVisible = (await page.locator('#case .case').count()) === 1;
  results.overflow.routes1440 = await overflowOf(page);
  await page.screenshot({ path: join(SHOTS, 'routes-1440.png'), fullPage: false });
  results.shots.push('routes-1440.png');
  await page.screenshot({ path: join(SHOTS, 'routes-1440-full.png'), fullPage: true });
  results.shots.push('routes-1440-full.png');
  await context.close();
}

// 旧 #/wecom 重定向
{
  const { page, context } = await openPage('#/wecom', 1440);
  await page.waitForTimeout(300);
  results.counts.legacyHash = await page.evaluate(() => window.location.hash);
  results.counts.legacyRendersRoutes = (await page.locator('.page--routes').count()) === 1;
  await context.close();
}

// 口径页
{
  const { page, context } = await openPage('#/method', 1440);
  results.counts.methodSections = await page.locator('.page--method .section').count();
  results.counts.methodHasWecomScoreWording = (await page.locator('body').innerText()).includes('企微适配度');
  await page.screenshot({ path: join(SHOTS, 'method-1440.png'), fullPage: false });
  results.shots.push('method-1440.png');
  await context.close();
}

// 键盘可达：Tab 首次聚焦应为「跳到主要内容」
{
  const { page, context } = await openPage('#/', 1440);
  await page.keyboard.press('Tab');
  results.counts.firstTabFocus = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? '',
  );
  await context.close();
}

await browser.close();

// 全页面 × 四档宽度横向溢出矩阵（同时收集控制台错误）
const matrixBrowser = await chromium.launch({ channel: 'msedge', headless: true });
const matrixRoutes = [
  { name: 'home', hash: '#/' },
  { name: 'all', hash: '#/all' },
  { name: 'repo', hash: `#/repo/${encodeURIComponent(detailRepo.id)}` },
  {
    name: 'compare',
    hash: `#/compare?ids=${compareRepos.map((repo) => encodeURIComponent(repo.id)).join(',')}`,
  },
  { name: 'routes', hash: '#/routes' },
  { name: 'method', hash: '#/method' },
];
const matrix = [];
for (const route of matrixRoutes) {
  for (const width of [375, 768, 1024, 1440]) {
    const context = await matrixBrowser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error')
        results.consoleErrors.push({ hash: `${route.hash}@${width}`, message: msg.text() });
    });
    page.on('pageerror', (error) =>
      results.pageErrors.push({ hash: `${route.hash}@${width}`, message: String(error) }),
    );
    await page.goto(`${base}${route.hash}`, { waitUntil: 'load' });
    await page.waitForTimeout(200);
    const size = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    matrix.push({
      route: route.name,
      width,
      ...size,
      ok: size.scrollWidth <= size.clientWidth + 1,
    });
    await context.close();
  }
}
await matrixBrowser.close();
results.matrix = matrix;

results.summary = {
  consoleErrorCount: results.consoleErrors.length,
  pageErrorCount: results.pageErrors.length,
  overflowAllOk:
    Object.values(results.overflow).every((item) => item.ok) &&
    matrix.every((item) => item.ok),
  matrixFailures: matrix.filter((item) => !item.ok),
  rankCountOk: results.counts.rankCount === 140 && results.counts.rankFileItems === 140,
  top10Ok: results.counts.homeTop10MatchesRankFile === true,
  allRowsOk: results.counts.allRows === 140,
  detailSectionsOk: results.counts.detailSections === 13,
  noWecomScoring:
    results.counts.homeHasWecomScoreWording === false &&
    results.counts.allHasWecomScoreWording === false &&
    results.counts.methodHasWecomScoreWording === false &&
    results.counts.detailHasWecomSection === false,
};

console.log(JSON.stringify(results, null, 2));
log(`截图 ${results.shots.length} 张，控制台错误 ${results.summary.consoleErrorCount} 条`);
