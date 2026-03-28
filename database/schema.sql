-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(100) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `email_verified_at` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `last_login_ip` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建会话表（用于存储 session）
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `payload` TEXT NOT NULL,
  `last_activity` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表';

-- 创建政策表（替换 sample data）
CREATE TABLE IF NOT EXISTS `policies` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `region_name` VARCHAR(200) NOT NULL,
  `lat` DECIMAL(10, 6) DEFAULT NULL,
  `lng` DECIMAL(10, 6) DEFAULT NULL,
  `policy_type` VARCHAR(50) DEFAULT NULL,
  `target_audience` VARCHAR(200) DEFAULT NULL,
  `summary` TEXT DEFAULT NULL,
  `requirements` TEXT DEFAULT NULL,
  `materials` TEXT DEFAULT NULL,
  `official_url` VARCHAR(500) DEFAULT NULL,
  `deadline` DATE DEFAULT NULL,
  `published_on` DATE DEFAULT NULL,
  `source_name` VARCHAR(200) DEFAULT NULL,
  `updated_at` DATE NOT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `tags` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_db` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_region` (`region_name`),
  KEY `idx_type` (`policy_type`),
  KEY `idx_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='政策表';

-- 创建用户收藏表
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `policy_id` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_policy` (`user_id`, `policy_id`),
  KEY `idx_policy_id` (`policy_id`),
  CONSTRAINT `fk_user_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- 插入示例管理员账号（密码需要哈希后插入，这里先留空）
-- 默认管理员：admin@opc-lab.com / Admin123! (需要在应用中使用 bcrypt 生成哈希)

-- ==================== RBAC 相关表 ====================

-- 角色表
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码 (module:action)',
  `module` VARCHAR(50) NOT NULL COMMENT '所属模块',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 菜单表
CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父菜单 ID',
  `name` VARCHAR(100) NOT NULL COMMENT '菜单名称',
  `path` VARCHAR(255) DEFAULT NULL COMMENT '路由路径',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标名称',
  `type` ENUM('menu', 'button') NOT NULL DEFAULT 'menu' COMMENT '类型',
  `permission_code` VARCHAR(100) DEFAULT NULL COMMENT '关联权限代码',
  `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_menus_parent` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- ==================== 文章模块相关表 ====================

-- 文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL COMMENT '标题',
  `slug` VARCHAR(200) NOT NULL UNIQUE COMMENT 'URL 友好标识',
  `summary` TEXT DEFAULT NULL COMMENT '摘要',
  `content` LONGTEXT NOT NULL COMMENT '正文内容 (HTML)',
  `cover_image` VARCHAR(500) DEFAULT NULL COMMENT '封面图',
  `author_id` INT UNSIGNED DEFAULT NULL COMMENT '作者 ID',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
  `meta_title` VARCHAR(200) DEFAULT NULL COMMENT 'SEO 标题',
  `meta_description` TEXT DEFAULT NULL COMMENT 'SEO 描述',
  `meta_keywords` VARCHAR(500) DEFAULT NULL COMMENT 'SEO 关键词',
  `static_path` VARCHAR(500) DEFAULT NULL COMMENT '静态文件路径',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 文章分类表
CREATE TABLE IF NOT EXISTS `article_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL 标识',
  `description` TEXT DEFAULT NULL,
  `sort_order` INT UNSIGNED DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类表';

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS `article_tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` INT UNSIGNED NOT NULL,
  `tag_name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- 文章分类关联表
CREATE TABLE IF NOT EXISTS `article_category_map` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_category` (`article_id`, `category_id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_article_category_map_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_category_map_category` FOREIGN KEY (`category_id`) REFERENCES `article_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类关联表';

-- ==================== 初始化数据 ====================

-- 默认角色
INSERT INTO `roles` (`name`, `code`, `description`, `status`) VALUES
('超级管理员', 'super_admin', '拥有所有权限', 'active'),
('编辑', 'editor', '可以创建和编辑内容', 'active'),
('普通用户', 'user', '基本访问权限', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 默认权限
INSERT INTO `permissions` (`name`, `code`, `module`, `description`) VALUES
-- 政策管理
('查看政策', 'policies:view', 'policies', '查看所有政策'),
('创建政策', 'policies:create', 'policies', '创建新政策'),
('编辑政策', 'policies:edit', 'policies', '编辑现有政策'),
('删除政策', 'policies:delete', 'policies', '删除政策'),
-- 文章管理
('查看文章', 'articles:view', 'articles', '查看所有文章'),
('创建文章', 'articles:create', 'articles', '创建新文章'),
('编辑文章', 'articles:edit', 'articles', '编辑现有文章'),
('删除文章', 'articles:delete', 'articles', '删除文章'),
('发布文章', 'articles:publish', 'articles', '发布文章'),
-- 用户管理
('查看用户', 'users:view', 'users', '查看所有用户'),
('编辑用户', 'users:edit', 'users', '编辑用户信息'),
('删除用户', 'users:delete', 'users', '删除用户'),
-- 角色管理
('查看角色', 'roles:view', 'roles', '查看所有角色'),
('创建角色', 'roles:create', 'roles', '创建新角色'),
('编辑角色', 'roles:edit', 'roles', '编辑角色权限'),
('删除角色', 'roles:delete', 'roles', '删除角色'),
-- 菜单管理
('查看菜单', 'menus:view', 'menus', '查看所有菜单'),
('创建菜单', 'menus:create', 'menus', '创建新菜单'),
('编辑菜单', 'menus:edit', 'menus', '编辑菜单'),
('删除菜单', 'menus:delete', 'menus', '删除菜单')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 默认菜单
INSERT INTO `menus` (`name`, `path`, `icon`, `type`, `permission_code`, `sort_order`) VALUES
('管理后台', '/admin', 'LayoutDashboard', 'menu', NULL, 1),
('仪表盘', '/admin/dashboard', 'Home', 'menu', 'policies:view', 10),
('政策管理', '/admin/policies', 'FileText', 'menu', 'policies:view', 20),
('文章管理', '/admin/articles', 'Newspaper', 'menu', 'articles:view', 30),
('用户管理', '/admin/users', 'Users', 'menu', 'users:view', 40),
('角色管理', '/admin/roles', 'Shield', 'menu', 'roles:view', 50),
('菜单管理', '/admin/menus', 'Menu', 'menu', 'menus:view', 60)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 给默认管理员分配超级管理员角色
INSERT INTO `user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id FROM `users` u, `roles` r
WHERE u.email = 'admin@opc-lab.com' AND r.code = 'super_admin'
ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`);
