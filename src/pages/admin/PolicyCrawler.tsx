import { useState } from "react";
import { CloudDownload, Search, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";
import { fetchPolicyCrawlerStatus, triggerPolicyCrawler } from "@/api";

export default function PolicyCrawler() {
  const { toast } = usePolicyMapStore();
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<{
    success?: boolean;
    count?: number;
    message?: string;
  } | null>(null);

  const handleFetchAll = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await triggerPolicyCrawler() as any;
      setResult(data);
      if (data?.success) {
        toast(`成功获取 ${data?.count} 条新政策`);
      } else {
        toast("爬取失败：" + (data?.message || "未知错误"));
      }
    } catch (error) {
      toast("爬取失败：" + error);
      setResult({ success: false, message: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFetch = async () => {
    if (!keyword.trim()) {
      toast("请输入搜索关键词");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await triggerPolicyCrawler(keyword) as any;
      setResult(data);
      if (data?.success) {
        toast(`成功获取 ${data?.count} 条新政策`);
      } else {
        toast("爬取失败：" + (data?.message || "未知错误"));
      }
    } catch (error) {
      toast("爬取失败：" + error);
      setResult({ success: false, message: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  const quickKeywords = [
    "OPC 一人公司 政策",
    "人工智能 创业补贴",
    "算力券 申请",
    "超级个体 扶持",
    "AI 创业 政策",
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">政策爬虫</h1>
          <p className="mt-1 text-sm text-slate-600">自动从互联网获取 OPC 相关政策信息</p>
        </div>
        <Button variant="primary" onClick={handleFetchAll} disabled={loading}>
          <CloudDownload className="mr-2 h-4 w-4" />
          {loading ? "爬取中..." : "一键爬取"}
        </Button>
      </div>

      {/* 定时任务说明 */}
      <Card className="mt-4 p-4 bg-emerald-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-emerald-900">定时任务已启动</div>
            <div className="mt-1 text-sm text-emerald-700">
              系统会在每天凌晨 2:00 自动爬取最新政策，无需手动操作。
              你也可以使用下方功能手动触发爬取。
            </div>
          </div>
        </div>
      </Card>

      {/* 搜索关键词爬取 */}
      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-slate-400" />
          <div className="text-sm font-medium text-slate-700">按关键词爬取</div>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchFetch()}
            placeholder="输入搜索关键词，例如：OPC 一人公司 补贴"
            className="flex-1 h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          <Button variant="primary" onClick={handleSearchFetch} disabled={loading}>
            搜索并爬取
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => {
                setKeyword(kw);
              }}
              className="px-3 py-1.5 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              {kw}
            </button>
          ))}
        </div>
      </Card>

      {/* 爬取结果 */}
      {result && (
        <Card className={`mt-4 p-4 ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <div className={`text-sm font-semibold ${result.success ? "text-emerald-900" : "text-red-900"}`}>
                {result.success ? "爬取成功" : "爬取失败"}
              </div>
              <div className={`mt-1 text-sm ${result.success ? "text-emerald-700" : "text-red-700"}`}>
                {result.message}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="mt-4 p-4">
        <div className="text-sm font-semibold text-slate-700">使用说明</div>
        <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc list-inside">
          <li>一键爬取：使用预设的关键词列表批量获取政策</li>
          <li>按关键词爬取：输入特定关键词搜索并爬取相关政策</li>
          <li>定时任务：每天凌晨 2 点自动执行爬取任务</li>
          <li>爬取的政策会自动存入数据库，可在政策管理中查看和编辑</li>
        </ul>
      </Card>
    </div>
  );
}
