import { Role } from '@/generated/prisma';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';
import { ROLES } from '@/shared/constants/roles';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { FullUser } from '../users/types/user.type';
import { CreateRoleDto } from './dto/create-role.dto';
import * as rolesController from './roles-controller-swagger.decorators';
import { RolesService } from './roles.service';

@ApiTags('Role')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @rolesController.ApiGetAllRoles()
  @UseGuards(JwtAccessGuard)
  @Get()
  public async getAll(): Promise<Role[]> {
    return this.rolesService.getAll();
  }

  @Get('/hierarchy')
  public async getHierarchy(): Promise<{ name: string; priority: number }[]> {
    return this.rolesService.getHierarchy();
  }

  @rolesController.ApiGetOneRole()
  @UseGuards(JwtAccessGuard)
  @Get(':roleName')
  public async getOne(@Param('roleName') name: string): Promise<Role> {
    return this.rolesService.getOne({ name });
  }

  @rolesController.ApiCreateRole()
  @UseGuards(JwtAccessGuard)
  @Post()
  public async createOne(@Body() dto: CreateRoleDto, @CurrentUser() user: FullUser | null): Promise<Role> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.SUPER_ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.rolesService.createOne(dto);
  }

  @rolesController.ApiDeleteAllRoles()
  @UseGuards(JwtAccessGuard)
  @Delete()
  public async deleteAll(@CurrentUser() user: FullUser | null): Promise<BatchPayload> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.SUPER_ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.rolesService.deleteAll();
  }

  @rolesController.ApiDeleteOneRole()
  @UseGuards(JwtAccessGuard)
  @Delete(':roleId')
  public async deleteOne(
    @Param('roleId', ParseIntPipe) id: number,
    @CurrentUser() user: FullUser | null,
  ): Promise<Role> {
    const hasAccess = await this.rolesService.hasPriorityAtLeast(user?.roles ?? [], ROLES.SUPER_ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException();
    }

    return this.rolesService.deleteOne({ id });
  }
}
