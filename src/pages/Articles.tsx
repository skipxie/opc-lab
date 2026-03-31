import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Search } from "lucide-react";

import Container from "@/components/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchArticles } from "@/api";
import { setPageMeta } from "@/utils/meta";

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  viewCount: number;
}

export default function Articles() {
  setPageMeta({
    title: "文章列表 - 光未在线 OPC",
    description: "创业经验、政策解读、实操干货",
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadArticles();
  }, [page, searchQuery]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetchArticles(page, limit);
      setArticles(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("加载文章失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">文章列表</h1>
        <p className="mt-2 text-sm text-slate-600">创业经验、政策解读、实操干货</p>
      </div>

      {/* 搜索框 */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </Card>

      {/* 文章列表 */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">加载中...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="p-5 hover:shadow-md transition-shadow">
                <Link to={`/articles/${article.slug}`}>
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold">{article.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {article.summary}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                        </span>
                        <span>阅读 {article.viewCount}</span>
                      </div>
                      <span className="text-emerald-600 text-sm font-medium">阅读 →</span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              暂无文章
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-slate-600 px-4">
                第 {page} 页 / 共 {totalPages} 页
              </span>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
