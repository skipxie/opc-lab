-- 创建爬虫配置表
CREATE TABLE IF NOT EXISTS `crawler_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) NOT NULL UNIQUE,
  `value` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫配置表';

-- 插入默认配置
INSERT INTO `crawler_config` (`key`, `value`, `description`)
VALUES ('schedule_enabled', 'true', '爬虫定时任务是否启用 (true/false)')
ON DUPLICATE KEY UPDATE `value` = `value`;
