import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { fetchAdminArticles, publishArticle, unpublishArticle, deleteArticle } from "@/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

interface Article {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = usePolicyMapStore();

  useEffect(() => {
    loadArticles();
  }, [page, searchQuery, statusFilter]);

  const loadArticles = async () => {
    try {
      const res = await fetchAdminArticles({ page, limit, q: searchQuery, status: statusFilter || undefined });
      setArticles(res.data);
      setTotal(res.total);
    } catch (error) {
      toast("加载文章列表失败");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishArticle(id);
      toast("文章已发布");
      loadArticles();
    } catch (error) {
      toast("发布失败");
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishArticle(id);
      toast("文章已取消发布");
      loadArticles();
    } catch (error) {
      toast("操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    try {
      await deleteArticle(id);
      toast("文章已删除");
      loadArticles();
    } catch (error) {
      toast("删除失败");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusLabels = {
    draft: "草稿",
    published: "已发布",
    archived: "已归档",
  };

  const statusColors = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-slate-100 text-slate-500",
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">文章管理</h1>
          <p className="mt-1 text-sm text-slate-600">管理所有文章内容和发布状态</p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = "/admin/articles/new"}>
          <Plus className="mr-2 h-4 w-4" />
          添加文章
        </Button>
      </div>

      {/* 文章列表 */}

      <div className="mt-4 flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[200px] p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </Card>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      <Card className="mt-4 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">标题</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">标识</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">浏览</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">发布时间</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium">{article.title}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{article.slug}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[article.status]}`}>
                    {statusLabels[article.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{article.viewCount}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("zh-CN") : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => article.status === "published" ? handleUnpublish(article.id) : handlePublish(article.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title={article.status === "published" ? "取消发布" : "发布"}
                    >
                      {article.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button className="text-emerald-600 hover:text-emerald-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            共 {total} 条，第 {page} 页 / 共 {totalPages} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
