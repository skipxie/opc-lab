import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RbacService, CreateRoleDto, CreateMenuDto, UpdateMenuDto } from './rbac.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Menu } from './entities/menu.entity';

@Controller('api/admin')
export class RbacController {
  constructor(private rbacService: RbacService) {}

  // ===== 角色管理 =====
  @Get('roles')
  async getRoles(): Promise<Role[]> {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  async getRole(@Param('id') id: number): Promise<Role> {
    return this.rbacService.findRoleById(id);
  }

  @Post('roles')
  async createRole(@Body() data: CreateRoleDto): Promise<Role> {
    return this.rbacService.createRole(data);
  }

  @Put('roles/:id')
  async updateRole(@Param('id') id: number, @Body() data: any): Promise<Role> {
    return this.rbacService.updateRole(id, data);
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: number): Promise<void> {
    return this.rbacService.deleteRole(id);
  }

  // ===== 权限管理 =====
  @Get('permissions')
  async getPermissions(): Promise<Permission[]> {
    return this.rbacService.findAllPermissions();
  }

  // ===== 角色权限分配 =====
  @Get('roles/:id/permissions')
  async getRolePermissions(@Param('id') id: number): Promise<Permission[]> {
    return this.rbacService.getRolePermissions(id);
  }

  @Put('roles/:id/permissions')
  async assignPermissions(@Param('id') id: number, @Body('permissionIds') permissionIds: number[]): Promise<Role> {
    return this.rbacService.assignPermissions(id, permissionIds);
  }

  // ===== 菜单管理 =====
  @Get('menus')
  async getMenus(): Promise<Menu[]> {
    return this.rbacService.findAllMenus();
  }

  @Get('user/menus')
  async getUserMenus(@Query('userId') userId: number): Promise<Menu[]> {
    return this.rbacService.getUserMenus(userId);
  }

  @Post('menus')
  async createMenu(@Body() data: CreateMenuDto): Promise<Menu> {
    return this.rbacService.createMenu(data);
  }

  @Put('menus/:id')
  async updateMenu(@Param('id') id: number, @Body() data: UpdateMenuDto): Promise<Menu> {
    return this.rbacService.updateMenu(id, data);
  }

  @Delete('menus/:id')
  async deleteMenu(@Param('id') id: number): Promise<void> {
    return this.rbacService.deleteMenu(id);
  }

  // ===== 用户角色分配 =====
  @Post('users/:userId/roles/:roleId')
  async assignUserRole(@Param('userId') userId: number, @Param('roleId') roleId: number): Promise<void> {
    return this.rbacService.assignUserRole(userId, roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  async removeUserRole(@Param('userId') userId: number, @Param('roleId') roleId: number): Promise<void> {
    return this.rbacService.removeUserRole(userId, roleId);
  }
}
