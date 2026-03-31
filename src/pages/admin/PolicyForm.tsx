import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchPolicy, createPolicy, updatePolicy } from "@/api";

export default function AdminPolicyForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    regionName: "",
    policyType: "",
    targetAudience: "",
    summary: "",
    requirements: "",
    materials: "",
    officialUrl: "",
    deadline: "",
    publishedOn: "",
    sourceName: "",
    isFeatured: false,
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      loadPolicy(id);
    }
  }, [id, isEditMode]);

  const loadPolicy = async (policyId: string) => {
    try {
      const res = await fetchPolicy(policyId);
      const data = res.data;
      setFormData({
        title: data.title || "",
        regionName: data.regionName || "",
        policyType: data.policyType || "",
        targetAudience: data.targetAudience || "",
        summary: data.summary || "",
        requirements: data.requirements || "",
        materials: data.materials || "",
        officialUrl: data.officialUrl || "",
        deadline: data.deadline || "",
        publishedOn: data.publishedOn?.split("T")[0] || "",
        sourceName: data.sourceName || "",
        isFeatured: data.isFeatured || false,
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
      });
    } catch (error) {
      alert("加载政策失败");
      navigate("/admin/policies");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (isEditMode && id) {
        await updatePolicy(id, data);
        alert("政策更新成功");
      } else {
        await createPolicy(data);
        alert("政策创建成功");
      }
      navigate("/admin/policies");
    } catch (error: any) {
      alert("操作失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{isEditMode ? "编辑政策" : "添加政策"}</h1>
        <p className="mt-1 text-sm text-slate-600">{isEditMode ? "修改政策信息" : "填写政策信息"}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">政策标题</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">地区</label>
              <input
                type="text"
                required
                value={formData.regionName}
                onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">政策类型</label>
              <select
                value={formData.policyType}
                onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">请选择类型</option>
                <option value="补贴">补贴</option>
                <option value="税收优惠">税收优惠</option>
                <option value="贷款支持">贷款支持</option>
                <option value="创业支持">创业支持</option>
                <option value="人才政策">人才政策</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">目标受众</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="例如：个体工商户、小微企业"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">来源名称</label>
              <input
                type="text"
                value={formData.sourceName}
                onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">发布日期</label>
              <input
                type="date"
                value={formData.publishedOn}
                onChange={(e) => setFormData({ ...formData, publishedOn: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">截止日期</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">官方链接</label>
              <input
                type="url"
                value={formData.officialUrl}
                onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">政策摘要</label>
            <textarea
              rows={4}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="简要描述政策内容..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">申报条件</label>
            <textarea
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="列出申报条件..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">申报材料</label>
            <textarea
              rows={4}
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="列出所需材料..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">标签（用逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="例如：创业，补贴，小微企业"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">
              设为推荐政策（在首页显示）
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/policies")}>
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "保存中..." : "保存政策"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
