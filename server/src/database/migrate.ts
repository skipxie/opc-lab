import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

async function runMigration() {
  const AppDataSource = new DataSource({
    type: 'mysql',
    host: '8.163.33.195',
    port: 3806,
    username: 'opclab_X14.',
    password: 'bBJHLwL8exXtz2kF',
    database: 'opc',
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: true,
    logging: true,
  });

  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully!');
    console.log('Tables synchronized!');

    // 检查管理员账号是否存在
    const userRepo = AppDataSource.getRepository('User');
    const adminExists = await userRepo.findOne({ where: { email: 'admin@opc-lab.com' } });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin123!', salt);

      await AppDataSource.query(`
        INSERT INTO users (email, username, password_hash, role, nickname, created_at, updated_at)
        VALUES ('admin@opc-lab.com', 'admin', '${passwordHash}', 'admin', '管理员', NOW(), NOW())
      `);
      console.log('Default admin account created: admin@opc-lab.com / Admin123!');
    }

    await AppDataSource.destroy();
    console.log('Migration completed!');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

runMigration();
