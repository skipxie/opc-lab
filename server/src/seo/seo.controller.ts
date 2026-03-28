import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

@Controller()
export class SeoController {
  @Get('sitemap.xml')
  getSitemap(@Res() res: Response) {
    const sitemapPath = join(process.cwd(), 'dist', 'static', 'sitemap.xml');

    if (existsSync(sitemapPath)) {
      res.setHeader('Content-Type', 'application/xml');
      res.send(readFileSync(sitemapPath, 'utf-8'));
    } else {
      // 返回基础 sitemap
      const baseUrl = process.env.BASE_URL || 'https://opc-lab.com';
      const now = new Date().toISOString();

      res.setHeader('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/policy-map</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/community</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
    }
  }

  @Get('robots.txt')
  getRobots(@Res() res: Response) {
    const baseUrl = process.env.BASE_URL || 'https://opc-lab.com';

    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login
Disallow: /register

Sitemap: ${baseUrl}/sitemap.xml`);
  }
}
