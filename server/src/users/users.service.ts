import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserFavorite } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserFavorite)
    private favoritesRepository: Repository<UserFavorite>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查邮箱是否已存在
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 检查用户名是否已存在
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('用户名已被使用');
    }

    // 哈希密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateLastLogin(user: User, ip: string): Promise<void> {
    await this.usersRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  async toggleFavorite(userId: number, policyId: string): Promise<UserFavorite> {
    const existing = await this.favoritesRepository.findOne({
      where: { userId, policyId },
    });

    if (existing) {
      await this.favoritesRepository.remove(existing);
      throw new NotFoundException('已取消收藏');
    }

    const favorite = this.favoritesRepository.create({ userId, policyId });
    return this.favoritesRepository.save(favorite);
  }

  async getFavorites(userId: number): Promise<UserFavorite[]> {
    return this.favoritesRepository.find({ where: { userId } });
  }

  async findAll(options: {
    where?: FindOptionsWhere<User>;
    page?: number;
    limit?: number;
  }): Promise<[User[], number]> {
    const { where, page = 1, limit = 20 } = options;
    return this.usersRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  nickname?: string;
}
