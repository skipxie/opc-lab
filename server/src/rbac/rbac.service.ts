import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Menu, MenuStatus } from './entities/menu.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menusRepository: Repository<Menu>,
  ) {}

  // 获取所有角色
  async findAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({ order: { createdAt: 'DESC' } });
  }

  // 获取单个角色
  async findRoleById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  // 创建角色
  async createRole(data: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOne({
      where: [{ code: data.code }, { name: data.name }],
    });
    if (existing) {
      throw new ForbiddenException('角色代码或名称已存在');
    }
    const role = this.rolesRepository.create(data);
    return this.rolesRepository.save(role);
  }

  // 更新角色
  async updateRole(id: number, data: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);
    Object.assign(role, data);
    return this.rolesRepository.save(role);
  }

  // 删除角色
  async deleteRole(id: number): Promise<void> {
    const role = await this.findRoleById(id);
    await this.rolesRepository.remove(role);
  }

  // 获取所有权限
  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find({ order: { module: 'ASC', code: 'ASC' } });
  }

  // 获取角色的权限
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    return role?.permissions || [];
  }

  // 分配权限给角色
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const permissions = await this.permissionsRepository.findBy({ id: In(permissionIds) });
    role.permissions = permissions;
    return this.rolesRepository.save(role);
  }

  // 检查用户是否有指定权限
  async checkPermission(userId: number, permissionCode: string): Promise<boolean> {
    // 简单实现：超级管理员拥有所有权限
    const userRoles = await this.getUserRoles(userId);
    if (userRoles.some(r => r.code === 'super_admin')) {
      return true;
    }

    // 检查角色权限
    for (const role of userRoles) {
      const permissions = await this.getRolePermissions(role.id);
      if (permissions.some(p => p.code === permissionCode)) {
        return true;
      }
    }
    return false;
  }

  // 获取用户的角色
  async getUserRoles(userId: number): Promise<Role[]> {
    const result = await this.rolesRepository
      .createQueryBuilder('role')
      .innerJoin('user_roles', 'ur', 'ur.role_id = role.id')
      .where('ur.user_id = :userId', { userId })
      .getMany();
    return result;
  }

  // 获取用户可见的菜单
  async getUserMenus(userId: number): Promise<Menu[]> {
    // 超级管理员可以看到所有菜单
    const userRoles = await this.getUserRoles(userId);
    if (userRoles.some(r => r.code === 'super_admin')) {
      return this.menusRepository.find({
        where: { status: MenuStatus.ACTIVE },
        order: { sortOrder: 'ASC' },
        relations: ['parent'],
      });
    }

    // 如果没有角色，返回空菜单（或返回所有菜单）
    if (userRoles.length === 0) {
      // 默认返回所有激活的菜单
      return this.menusRepository.find({
        where: { status: MenuStatus.ACTIVE },
        order: { sortOrder: 'ASC' },
        relations: ['parent'],
      });
    }

    // 获取用户角色的权限代码
    const permissions = await this.getPermissionsByUser(userId);
    const permissionCodes = permissions.map(p => p.code);

    // 查询有权限访问的菜单
    return this.menusRepository
      .createQueryBuilder('menu')
      .where('menu.status = :status', { status: MenuStatus.ACTIVE })
      .andWhere('menu.permissionCode IS NULL OR menu.permissionCode IN (:...codes)', { codes: permissionCodes })
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }

  // 获取用户的所有权限
  async getPermissionsByUser(userId: number): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId);
    const roleIds = userRoles.map(r => r.id);

    const result = await this.permissionsRepository
      .createQueryBuilder('permission')
      .innerJoin('role_permissions', 'rp', 'rp.permission_id = permission.id')
      .where('rp.role_id IN (:...roleIds)', { roleIds })
      .getMany();

    // 去重
    const uniqueMap = new Map();
    result.forEach(p => uniqueMap.set(p.id, p));
    return Array.from(uniqueMap.values());
  }

  // 获取所有菜单
  async findAllMenus(): Promise<Menu[]> {
    return this.menusRepository.find({
      order: { sortOrder: 'ASC' },
      relations: ['parent', 'children'],
    });
  }

  // 创建菜单
  async createMenu(data: CreateMenuDto): Promise<Menu> {
    const menu = this.menusRepository.create() as any;
    menu.parentId = data.parentId || null;
    menu.name = data.name;
    menu.path = data.path;
    menu.icon = data.icon;
    menu.type = data.type || 'menu';
    menu.permissionCode = data.permissionCode;
    menu.sortOrder = data.sortOrder || 0;
    return this.menusRepository.save(menu);
  }

  // 更新菜单
  async updateMenu(id: number, data: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menusRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    Object.assign(menu, data);
    return this.menusRepository.save(menu);
  }

  // 删除菜单
  async deleteMenu(id: number): Promise<void> {
    const menu = await this.menusRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    await this.menusRepository.remove(menu);
  }

  // 为用户分配角色
  async assignUserRole(userId: number, roleId: number): Promise<void> {
    await this.rolesRepository.query(
      'INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())',
      [userId, roleId],
    );
  }

  // 移除用户角色
  async removeUserRole(userId: number, roleId: number): Promise<void> {
    await this.rolesRepository.query(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId],
    );
  }
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
}

export interface CreateMenuDto {
  parentId?: number;
  name: string;
  path?: string;
  icon?: string;
  type: string;
  permissionCode?: string;
  sortOrder?: number;
}

export interface UpdateMenuDto {
  parentId?: number;
  name?: string;
  path?: string;
  icon?: string;
  type?: string;
  permissionCode?: string;
  sortOrder?: number;
  status?: string;
}
