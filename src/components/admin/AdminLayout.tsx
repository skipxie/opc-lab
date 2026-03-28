import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  Shield,
  Menu as MenuIcon,
  LogOut,
  X,
  ChevronRight,
  CloudDownload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuIconMap: Record<string, any> = {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  Shield,
  Menu: MenuIcon,
  CloudDownload,
};

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
  parentId: number | null;
  children?: MenuItem[];
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 检查用户是否登录
    const userStr = localStorage.getItem("opc_current_user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(userStr));

    // 使用默认菜单（不依赖后端 API）
    setMenus([
      { id: 1, name: "仪表盘", path: "/admin/dashboard", icon: "LayoutDashboard", parentId: null },
      { id: 2, name: "政策管理", path: "/admin/policies", icon: "FileText", parentId: null },
      { id: 3, name: "文章管理", path: "/admin/articles", icon: "Newspaper", parentId: null },
      { id: 4, name: "用户管理", path: "/admin/users", icon: "Users", parentId: null },
      { id: 5, name: "角色管理", path: "/admin/roles", icon: "Shield", parentId: null },
      { id: 6, name: "政策爬虫", path: "/admin/policy-crawler", icon: "CloudDownload", parentId: null },
    ]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("opc_current_user");
    navigate("/login");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 移动设备遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/admin" className="text-lg font-semibold">
            管理后台
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4">
          {menus.map((menu) => {
            const Icon = menuIconMap[menu.icon] || LayoutDashboard;
            return (
              <div key={menu.id}>
                <Link
                  to={menu.path}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <Icon className="h-5 w-5" />
                  <span>{menu.name}</span>
                </Link>
                {menu.children && menu.children.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {menu.children.map((child) => {
                      const ChildIcon = menuIconMap[child.icon] || ChevronRight;
                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="md:ml-64">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-slate-600">
              {currentUser.nickname || currentUser.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span>退出</span>
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
