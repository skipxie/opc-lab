import { BadgeCheck, CircleCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Container from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { setPageMeta } from "@/utils/meta";
import { safeLocalStorage } from "@/utils/storage";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

type ContactType = "email" | "wechat";

const stages = ["想法阶段", "准备启动", "已在执行", "已有收入", "需要加速"] as const;
const interestOptions = ["政策雷达", "AI 工作流", "产品/增长", "合规/财税", "同伴复盘"] as const;

export default function Community() {
  setPageMeta({
    title: "加入社区｜和同伴一起在光未在线OPC",
    description: "填写信息后我会与你联系确认；你将获得每周政策解读与 AI 工作流模板。",
  });

  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [contactType, setContactType] = useState<ContactType>("wechat");
  const [contactValue, setContactValue] = useState("");
  const [city, setCity] = useState("");
  const [stage, setStage] = useState<(typeof stages)[number]>(stages[1]);
  const [interests, setInterests] = useState<string[]>(["政策雷达", "AI 工作流"]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return contactValue.trim().length > 0 && consent;
  }, [contactValue, consent]);

  const toggleInterest = (v: string) => {
    setInterests((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const submit = () => {
    setError(null);
    if (!contactValue.trim()) {
      setError(contactType === "email" ? "请填写邮箱" : "请填写微信号");
      return;
    }
    if (!consent) {
      setError("请勾选隐私同意");
      return;
    }
    const lead = {
      id: crypto.randomUUID(),
      name: name.trim(),
      contactType,
      contactValue: contactValue.trim(),
      city: city.trim(),
      stage,
      interests,
      createdAt: new Date().toISOString(),
    };
    const key = "opc_community_leads";
    const prev = safeLocalStorage.getJson<unknown[]>(key) ?? [];
    safeLocalStorage.setJson(key, [lead, ...prev]);
    usePolicyMapStore.getState().toast("已提交，我会尽快联系你");
    setSubmitted(true);
  };

  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--primary)]" />
            每周节奏 · 同伴互助 · 模板复盘
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">把“一人公司”做成可持续系统</h1>
          <div className="mt-3 text-sm leading-relaxed text-slate-600">
            你将得到政策雷达、AI 行动模板与同伴复盘机制。我会在 24 小时内联系你确认适配度。
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="text-sm font-semibold">适合你</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {["想把 AI 变成持续生产力", "需要政策资源与信息聚合", "愿意每周复盘推进", "正在启动副业/小产品"].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-[color:var(--primary)]" />
                    <div>{t}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-semibold">不太适合</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {["只想快速拿结果，不愿投入节奏", "希望一次性获取所有答案", "不接受信息有时效性"].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>{t}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <div className="text-lg font-semibold tracking-tight">你将获得</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "每周政策雷达",
                  desc: "按城市与标签聚合可用政策，给出要点与原文链接。",
                },
                {
                  title: "AI 行动模板",
                  desc: "把目标拆解成一周能做完的清单，配套复盘表。",
                },
                {
                  title: "同伴互助",
                  desc: "减少独自硬扛，遇到卡点能快速找到参考路径。",
                },
                {
                  title: "复盘机制",
                  desc: "每周固定节奏：回顾、选择、执行、复盘，持续迭代。",
                },
              ].map((b) => (
                <Card key={b.title} className="p-5">
                  <div className="text-sm font-semibold">{b.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">{b.desc}</div>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-[color:var(--primary)]" />
              隐私说明
            </div>
            <div className="mt-2 text-sm leading-relaxed text-slate-600">
              你提交的信息仅用于联系与服务改进，不会对外公开。如需删除数据，可在联系时提出。
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Card className="p-6">
              {!submitted ? (
                <div>
                  <div className="text-lg font-semibold tracking-tight">报名表单</div>
                  <div className="mt-2 text-sm text-slate-600">提交后我会在 24 小时内联系你。</div>

                  <div className="mt-5 grid gap-4">
                    <div>
                      <div className="text-xs font-medium text-slate-700">称呼（可选）</div>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
                        placeholder="怎么称呼你"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-700">联系方式（必填）</div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant={contactType === "wechat" ? "primary" : "secondary"}
                          onClick={() => setContactType("wechat")}
                          className="flex-1"
                        >
                          微信
                        </Button>
                        <Button
                          variant={contactType === "email" ? "primary" : "secondary"}
                          onClick={() => setContactType("email")}
                          className="flex-1"
                        >
                          邮箱
                        </Button>
                      </div>
                      <input
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        className="mt-2 h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
                        placeholder={contactType === "email" ? "you@example.com" : "填写微信号"}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs font-medium text-slate-700">所在城市（可选）</div>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-2 h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
                          placeholder="例如：上海"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-700">当前阶段</div>
                        <select
                          value={stage}
                          onChange={(e) => setStage(e.target.value as (typeof stages)[number])}
                          className="mt-2 h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
                        >
                          {stages.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-700">关注方向</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {interestOptions.map((v) => {
                          const active = interests.includes(v);
                          return <Chip key={v} active={active} onClick={() => toggleInterest(v)} label={v} />;
                        })}
                      </div>
                    </div>

                    <label className="flex items-start gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[color:var(--border)]"
                      />
                      我同意你使用我的信息用于联系与服务改进
                    </label>

                    {error ? <div className="text-sm text-rose-600">{error}</div> : null}

                    <Button variant="primary" disabled={!canSubmit} onClick={submit}>
                      提交申请
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                    <CircleCheck className="h-3.5 w-3.5" />
                    提交成功
                  </div>
                  <div className="mt-4 text-lg font-semibold tracking-tight">已收到，我会尽快联系你</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">
                    你也可以先去政策列表收藏你关心的政策，等我联系时我们会更高效。
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild variant="primary">
                      <Link to="/policy-map">返回政策列表</Link>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSubmitted(false);
                        setContactValue("");
                        setConsent(false);
                        setError(null);
                      }}
                    >
                      再提交一条
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}

