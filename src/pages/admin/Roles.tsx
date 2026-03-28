import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { fetchRoles, deleteRole, fetchPermissions, assignPermissions } from "@/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: string;
}

interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionDrawerOpen, setPermissionDrawerOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const { toast } = usePolicyMapStore();

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await fetchRoles();
      setRoles(res);
    } catch (error) {
      toast("加载角色列表失败");
    }
  };

  const loadPermissions = async () => {
    try {
      const res = await fetchPermissions();
      setPermissions(res);
    } catch (error) {
      toast("加载权限列表失败");
    }
  };

  const handleOpenPermissions = async (role: Role) => {
    setSelectedRole(role);
    try {
      const res = await fetchRoles(); // 实际应该调用 fetchRolePermissions
      // TODO: 获取角色已有权限
      setPermissionDrawerOpen(true);
    } catch (error) {
      toast("加载权限失败");
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      await assignPermissions(selectedRole.id, selectedPermissions);
      toast("权限已更新");
      setPermissionDrawerOpen(false);
    } catch (error) {
      toast("保存失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个角色吗？")) return;

    try {
      await deleteRole(id);
      toast("角色已删除");
      loadRoles();
    } catch (error) {
      toast("删除失败");
    }
  };

  // 按模块分组权限
  const permissionsByModule = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">角色管理</h1>
          <p className="mt-1 text-sm text-slate-600">管理系统角色和权限分配</p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          添加角色
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{role.name}</h3>
                <p className="text-sm text-slate-500">{role.code}</p>
                {role.description && (
                  <p className="mt-2 text-sm text-slate-600">{role.description}</p>
                )}
                <div className="mt-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      role.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {role.status === "active" ? "启用" : "禁用"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenPermissions(role)}
              >
                <Settings className="mr-1 h-3 w-3" />
                权限
              </Button>
              <Button variant="secondary" size="sm">
                <Pencil className="mr-1 h-3 w-3" />
                编辑
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDelete(role.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                删除
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 权限分配抽屉 */}
      <Drawer
        open={permissionDrawerOpen}
        onClose={() => setPermissionDrawerOpen(false)}
        title={`分配权限 - ${selectedRole?.name}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPermissionDrawerOpen(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSavePermissions}>
              保存
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {Object.entries(permissionsByModule).map(([module, mods]) => (
            <div key={module}>
              <h4 className="font-medium text-slate-700">{module}</h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {mods.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([...selectedPermissions, perm.id]);
                        } else {
                          setSelectedPermissions(
                            selectedPermissions.filter((id) => id !== perm.id)
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    {perm.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
