import {
  Controller,
  Get,
  Post,
  Request,
  Param,
  UseGuards,
  CanActivate,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

// 简单的会话守卫
class AuthGuard implements CanActivate {
  canActivate(req: any): boolean {
    return !!req.session?.userId;
  }
}

@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // 管理员接口 - 获取用户列表
  @Get('admin/users')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('q') q?: string,
  ) {
    const where: any = {};
    if (q) {
      where.email = `%%${q}%%`;
    }
    const [data, total] = await this.usersService.findAll({
      where,
      page: Number(page),
      limit: Number(limit),
    });
    return { data, total };
  }

  @Get('me')
  async getMe(@Request() req) {
    if (!req.session?.userId) {
      return { authenticated: false };
    }
    const user = await this.usersService.findById(req.session.userId);
    if (!user) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }

  @Get('favorites')
  @UseGuards(AuthGuard)
  async getFavorites(@Request() req) {
    const favorites = await this.usersService.getFavorites(req.session.userId);
    return { data: favorites };
  }

  @Post('favorites/:policyId')
  @UseGuards(AuthGuard)
  async toggleFavorite(@Request() req, @Param('policyId') policyId: string) {
    try {
      const result = await this.usersService.toggleFavorite(
        req.session.userId,
        policyId,
      );
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, message: error.message || '操作失败' };
    }
  }
}
