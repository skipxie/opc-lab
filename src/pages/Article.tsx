import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Eye } from "lucide-react";

import Container from "@/components/Container";
import { Card } from "@/components/ui/Card";
import { setPageMeta } from "@/utils/meta";
import { fetchArticleBySlug } from "@/api";

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  viewCount: number;
  publishedAt: string;
  author?: {
    nickname?: string;
    username?: string;
  };
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    fetchArticleBySlug(slug)
      .then((res) => {
        setArticle(res.data);
        if (res.data) {
          setPageMeta({
            title: res.data.metaTitle || res.data.title,
            description: res.data.metaDescription || res.data.summary,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center py-20 text-slate-500">
          加载中...
        </div>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container className="py-12">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold">文章未找到</h1>
          <p className="mt-2 text-slate-600">该文章不存在或已被删除</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回首页
        </Link>
      </Container>

      <Container className="pb-12">
        <Card className="overflow-hidden">
          {/* 封面图 */}
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-64 w-full object-cover md:h-80"
            />
          )}

          <div className="p-6 md:p-10">
            {/* 标题和元信息 */}
            <h1 className="text-2xl font-bold md:text-3xl">{article.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {article.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author.nickname || article.author.username}</span>
                </div>
              )}
              {article.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount} 次浏览</span>
              </div>
            </div>

            {/* 摘要 */}
            {article.summary && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-slate-700">
                {article.summary}
              </div>
            )}

            {/* 正文 */}
            <div
              className="prose prose-slate mt-8 max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* SEO 关键词 */}
            {article.metaKeywords && (
              <div className="mt-8 flex flex-wrap gap-2">
                {article.metaKeywords.split(",").map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Container>
    </div>
  );
}
