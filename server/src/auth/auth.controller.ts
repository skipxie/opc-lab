import { Controller, Get, Post, Body, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response as ExpressResponse } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Request() req,
    @Response() res: ExpressResponse,
  ) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      const result = await this.authService.login(user, req.ip);
      req.session.userId = result.user.id;
      req.session.user = result.user;
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message || '登录失败' });
    }
  }

  @Post('register')
  async register(
    @Body() body: { email: string; username: string; password: string; nickname?: string },
    @Request() req,
    @Response() res: ExpressResponse,
  ) {
    try {
      const result = await this.authService.register(body, req.ip);
      req.session.userId = result.user.id;
      req.session.user = result.user;
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || '注册失败' });
    }
  }

  @Post('logout')
  async logout(@Request() req, @Response() res: ExpressResponse) {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ success: false, message: '登出失败' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  }

  @Get('me')
  async getMe(@Request() req, @Response() res: ExpressResponse) {
    if (!req.session?.userId) {
      return res.json({ authenticated: false });
    }
    return res.json({
      authenticated: true,
      user: req.session.user,
    });
  }
}
