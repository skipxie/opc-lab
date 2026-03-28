import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
import { fetchAdminUsers, fetchRoles, assignUserRole } from "@/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

interface User {
  id: number;
  email: string;
  username: string;
  nickname: string;
  role?: string;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  code: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const { toast } = usePolicyMapStore();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [page, searchQuery]);

  const loadUsers = async () => {
    try {
      const res = await fetchAdminUsers({ page, limit, q: searchQuery });
      setUsers(res.data);
      setTotal(res.total);
    } catch (error) {
      toast("加载用户列表失败");
    }
  };

  const loadRoles = async () => {
    try {
      const res = await fetchRoles();
      setRoles(res as Role[]);
    } catch (error) {
      // 忽略错误
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast("请选择角色");
      return;
    }

    try {
      await assignUserRole(selectedUser.id, parseInt(selectedRole));
      toast("角色分配成功");
      setShowRoleModal(false);
      loadUsers();
    } catch (error) {
      toast("分配失败");
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole("");
    setShowRoleModal(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">用户管理</h1>
          <p className="mt-1 text-sm text-slate-600">管理系统用户和角色分配</p>
        </div>
      </div>

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索用户邮箱、用户名..."
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
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">邮箱</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">用户名</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">昵称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">角色</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">注册时间</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600">{user.id}</td>
                <td className="px-4 py-3 text-sm">{user.email}</td>
                <td className="px-4 py-3 text-sm">{user.username}</td>
                <td className="px-4 py-3 text-sm">{user.nickname || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {user.role || "未分配"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openRoleModal(user)}
                      className="text-purple-600 hover:text-purple-800"
                      title="分配角色"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
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

      {/* 角色分配弹窗 */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold">分配角色</h3>
            <p className="mt-1 text-sm text-slate-600">
              为用户 {selectedUser?.nickname || selectedUser?.username} 分配角色
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">选择角色</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">请选择角色</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleAssignRole}>
                确认
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
