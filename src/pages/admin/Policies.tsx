import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { fetchAdminPolicies, deletePolicy } from "@/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

interface Policy {
  id: string;
  title: string;
  regionName: string;
  policyType: string;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = usePolicyMapStore();

  useEffect(() => {
    loadPolicies();
  }, [page, searchQuery]);

  const loadPolicies = async () => {
    try {
      const res = await fetchAdminPolicies({ page, limit, q: searchQuery });
      setPolicies(res.data);
      setTotal(res.total);
    } catch (error) {
      toast("加载政策列表失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条政策吗？")) return;

    try {
      await deletePolicy(id);
      toast("政策已删除");
      loadPolicies();
    } catch (error) {
      toast("删除失败");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">政策管理</h1>
          <p className="mt-1 text-sm text-slate-600">管理所有政策信息</p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = "/admin/policies/new"}>
          <Plus className="mr-2 h-4 w-4" />
          添加政策
        </Button>
      </div>

      {/* 政策列表 */}

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索政策标题..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">标题</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">地区</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">推荐</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">创建时间</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">{policy.title}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{policy.regionName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{policy.policyType}</td>
                <td className="px-4 py-3 text-sm">
                  {policy.isFeatured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">是</span>
                  ) : (
                    <span className="text-slate-400">否</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(policy.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {policies.length === 0 && (
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
