import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { fetchAdminArticle, createArticle, updateArticle, fetchArticleCategories } from "@/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

// Quill 编辑器
import Quill from 'quill';

export default function AdminArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef<HTMLDivElement>(null);
  const [quillEditor, setQuillEditor] = useState<any>(null);
  const initialized = useRef(false);
  const { toast } = usePolicyMapStore();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 加载分类
    fetchArticleCategories()
      .then((res) => setCategories(res as any[]))
      .catch(() => {});

    // 如果是编辑模式，加载文章数据
    if (id) {
      fetchAdminArticle(parseInt(id))
        .then((res) => {
          const article = res.data;
          setFormData({
            title: article.title || "",
            slug: article.slug || "",
            summary: article.summary || "",
            content: article.content || "",
            coverImage: article.coverImage || "",
            metaTitle: article.metaTitle || "",
            metaDescription: article.metaDescription || "",
            metaKeywords: article.metaKeywords || "",
            categoryId: "",
          });
        })
        .catch(() => {
          toast("加载文章失败");
          navigate("/admin/articles");
        });
    }
  }, [id]);

  // 初始化编辑器
  useEffect(() => {
    if (!editorRef.current || quillEditor || initialized.current) return;

    initialized.current = true;

    const editor = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ header: [1, 2, 3, false] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    editor.on("text-change", () => {
      setFormData((prev) => ({ ...prev, content: editor.root.innerHTML }));
    });

    setQuillEditor(editor);

    // 清理函数
    return () => {
      if (editor) {
        editor.off("text-change");
      }
    };
  }, [quillEditor]);

  // 编辑模式下设置内容
  useEffect(() => {
    if (quillEditor && formData.content) {
      const currentContent = quillEditor.root.innerHTML;
      // 只在编辑器为空时设置内容，避免循环
      if (!currentContent.trim() || currentContent === "<p><br></p>") {
        quillEditor.root.innerHTML = formData.content;
      }
    }
  }, [quillEditor, formData.content]);

  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.title.trim()) {
      toast("请输入标题");
      return;
    }
    if (!formData.slug.trim()) {
      toast("请输入 URL 标识");
      return;
    }
    if (!formData.content.trim()) {
      toast("请输入内容");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("opc_current_user") || "{}");
      const data = {
        ...formData,
        authorId: user.id,
      };

      if (id) {
        await updateArticle(parseInt(id), data);
        toast("文章已更新");
      } else {
        await createArticle(data, user.id);
        toast("文章已创建");
      }
      navigate("/admin/articles");
    } catch (error) {
      toast("操作失败");
    } finally {
      setLoading(false);
    }
  };

  // 生成 slug
  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{id ? "编辑文章" : "添加文章"}</h1>
          <p className="mt-1 text-sm text-slate-600">{id ? "修改文章内容" : "创建新文章"}</p>
        </div>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={generateSlug}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
              placeholder="输入文章标题"
            />
          </Card>

          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700">摘要</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              rows={3}
              placeholder="文章摘要，用于列表页显示"
            />
          </Card>

          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700">内容</label>
            <div ref={editorRef} className="mt-1 min-h-[300px] bg-white editor-container" />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700">URL 标识</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                placeholder="article-slug"
              />
              <Button variant="secondary" onClick={generateSlug} type="button">
                生成
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-500">用于 SEO 友好的 URL</p>
          </Card>

          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700">封面图</label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
              placeholder="https://..."
            />
          </Card>

          <Card className="p-4">
            <label className="block text-sm font-medium text-slate-700">分类</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-slate-700">SEO 设置</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-slate-500">Meta 标题</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder={formData.title || "默认使用文章标题"}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Meta 描述</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  rows={2}
                  placeholder={formData.summary || "默认使用文章摘要"}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Meta 关键词</label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="关键词 1, 关键词 2, 关键词 3"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
