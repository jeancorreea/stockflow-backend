import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';

type CoreAuthResponse = {
  employee_code: string;
  name: string;
  roles?: string[];
};

function isCoreAuthResponse(value: unknown): value is CoreAuthResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.employee_code === 'string' &&
    typeof data.name === 'string' &&
    (data.roles === undefined ||
      (Array.isArray(data.roles) &&
        data.roles.every((role) => typeof role === 'string')))
  );
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async syncUserFromCore(coreResponse: unknown): Promise<UserEntity> {
    if (!isCoreAuthResponse(coreResponse)) {
      throw new UnauthorizedException('Resposta invalida do Core');
    }

    const { employee_code, name, roles = [] } = coreResponse;

    let user = await this.usersRepository.findOne({
      where: { employee_code },
    });

    if (!user) {
      user = this.usersRepository.create({
        employee_code,
        name,
        roles,
      });
    } else {
      user.name = name;
      user.roles = roles;
    }

    user = await this.usersRepository.save(user);

    return user;
  }
}
