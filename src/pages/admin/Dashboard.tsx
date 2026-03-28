import { useEffect, useState } from "react";
import { FileText, Newspaper, Users, Star } from "lucide-react";
import { fetchAdminPolicies, fetchAdminArticles, fetchAdminUsers } from "@/api";
import { Card } from "@/components/ui/Card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    policies: 0,
    articles: 0,
    users: 0,
    featuredPolicies: 0,
  });

  useEffect(() => {
    // 获取统计数据
    Promise.all([
      fetchAdminPolicies({ page: 1, limit: 1 }),
      fetchAdminArticles({ page: 1, limit: 1 }),
      fetchAdminUsers({ page: 1, limit: 1 }),
    ]).then(([policies, articles, users]) => {
      setStats({
        policies: policies.total,
        articles: articles.total,
        users: users.total,
        featuredPolicies: 0, // 需要后端支持
      });
    }).catch(console.error);
  }, []);

  const statCards = [
    {
      title: "政策数量",
      value: stats.policies,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "文章数量",
      value: stats.articles,
      icon: Newspaper,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "用户数量",
      value: stats.users,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "推荐政策",
      value: stats.featuredPolicies,
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">仪表盘</h1>
      <p className="mt-1 text-sm text-slate-600">欢迎回来，这是您的管理后台概览。</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">快速操作</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/admin/policies"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              管理政策
            </a>
            <a
              href="/admin/articles"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
            >
              管理文章
            </a>
            <a
              href="/admin/users"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
            >
              管理用户
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">系统信息</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>系统版本</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>最后更新</span>
              <span>{new Date().toLocaleDateString("zh-CN")}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
