import { ArrowRight, BadgeCheck, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Container from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { setPageMeta } from "@/utils/meta";
import { fetchFeaturedPolicies, fetchArticles } from "@/api";
import { formatDateYmd } from "@/utils/date";

interface Policy {
  id: string;
  title: string;
  regionName: string;
  policyType: string;
  summary: string;
  deadline?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
}

export default function Home() {
  setPageMeta({
    title: "光未在线 OPC｜AI + 政策列表，让一人公司跑起来",
    description: "用 AI 把目标拆成行动清单；用政策列表找到你能用的资源；加入社区获得同伴与复盘。",
  });

  const [featured, setFeatured] = useState<Policy[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchFeaturedPolicies(6)
      .then((res) => setFeatured(res.data))
      .catch(console.error);

    fetchArticles(1, 6)
      .then((res) => setArticles(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="bg-[color:var(--bg)] text-white">
        <Container className="py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90">
                <Sparkles className="h-3.5 w-3.5" />
                AI 驱动 · 光未在线 OPC 系统
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                从目标到行动清单，
                <br />
                从政策到资源落地
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
                你不缺努力，缺的是一套可持续的节奏：用 AI 拆解任务、用政策列表找到可用资源、用社区把每周复盘跑起来。
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="primary">
                  <Link to="/policy-map">
                    查看政策列表 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondaryDark">
                  <Link to="/community">加入社区</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="border-white/10 bg-white/5 p-5 text-white">
                <div className="text-xs text-white/70">示例：输入目标</div>
                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  我想在 30 天内启动一个小产品
                </div>
                <div className="mt-5 text-xs text-white/70">AI 输出：行动清单</div>
                <div className="mt-3 grid gap-2">
                  {[
                    "确定目标用户与一句话价值主张",
                    "列出 MVP 功能清单与 7 天交付计划",
                    "搭建落地页并收集 20 个反馈",
                    "每周复盘：做对了什么、下周只做哪 3 件事",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-[color:var(--accent)]" />
                      <div className="text-white/90">{t}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[color:var(--primary)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold">AI 帮你行动</div>
            </div>
            <div className="mt-3 text-sm leading-relaxed text-slate-600">
              不是"懂更多"，而是把目标拆成一周能做完的任务，保证持续推进。
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MapPinned className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold">政策列表</div>
            </div>
            <div className="mt-3 text-sm leading-relaxed text-slate-600">
              用地区与标签快速定位你能用的政策资源，直接跳转到官方链接。
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold">社区节奏</div>
            </div>
            <div className="mt-3 text-sm leading-relaxed text-slate-600">
              同伴互助 + 模板 + 复盘机制，让你的行动变成"系统"，而不是"冲动"。
            </div>
          </Card>
        </div>
      </Container>

      <div className="bg-white">
        <Container className="py-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">本周可用政策</div>
              <div className="mt-2 text-sm text-slate-600">信息有时效性，点击查看详情后以官方原文为准。</div>
            </div>
            <Button asChild variant="secondary">
              <Link to="/policy-map">去政策列表</Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.title}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {p.regionName} · {p.policyType}
                    </div>
                  </div>
                  {p.deadline ? (
                    <div className="shrink-0 rounded-full bg-rose-50 px-2 py-1 text-[11px] text-rose-700">
                      截止 {formatDateYmd(p.deadline)}
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">长期有效</div>
                  )}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-slate-600">{p.summary}</div>
                <div className="mt-4">
                  <Button asChild variant="ghost">
                    <Link to={`/policy-map?focus=${encodeURIComponent(p.id)}`}>查看详情</Link>
                  </Button>
                </div>
              </Card>
            ))}
            {featured.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-slate-500">
                暂无推荐政策
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* 文章栏目 */}
      <div className="bg-slate-50">
        <Container className="py-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">最新文章</div>
              <div className="mt-2 text-sm text-slate-600">创业经验、政策解读、实操干货</div>
            </div>
            <Button asChild variant="secondary">
              <Link to="/articles">查看全部</Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="p-5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{article.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">{article.summary}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                    </div>
                    <Button asChild variant="ghost">
                      <Link to={`/articles/${article.slug}`}>阅读</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {articles.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-slate-500">
                暂无文章
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <Card className="overflow-hidden border-[color:var(--border)]">
          <div className="grid gap-0 md:grid-cols-12">
            <div className="bg-[color:var(--bg)] px-6 py-10 text-white md:col-span-7">
              <div className="text-2xl font-semibold tracking-tight">加入社区，跟着节奏走</div>
              <div className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
                每周政策雷达 + AI 行动模板 + 复盘机制：把"想做"变成"能做完"。提交后我会在 24 小时内联系你确认。
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="primary">
                  <Link to="/community">去报名</Link>
                </Button>
                <Button asChild variant="secondaryDark">
                  <Link to="/policy-map">先看政策列表</Link>
                </Button>
              </div>
            </div>
            <div className="px-6 py-10 md:col-span-5">
              <div className="text-sm font-semibold">适合你</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {["想把 AI 变成持续的生产力", "正在启动副业/小产品", "需要政策与资源信息聚合", "希望有人一起复盘推进"].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-[color:var(--primary)]" />
                    <div>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
