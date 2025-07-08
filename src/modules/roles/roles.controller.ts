import { RoleGuard } from '@/core/guards/role.guard';
import { Role } from '@/generated/prisma';
import { ROLES } from '@/shared/constants/roles';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../auth/guards/jwt-acess.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import * as rolesController from './roles-controller-swagger.decorators';
import { RolesService } from './roles.service';

@ApiTags('Role')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @rolesController.ApiGetAllRoles()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  @Get()
  public async getAll(): Promise<Role[]> {
    return this.rolesService.getAll();
  }

  @Get('/hierarchy')
  public async getHierarchy(): Promise<{ name: string; priority: number }[]> {
    return this.rolesService.getHierarchy();
  }

  @rolesController.ApiGetOneRole()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  @Get(':roleName')
  public async getOne(@Param('roleName') name: string): Promise<Role> {
    return this.rolesService.getOne({ name });
  }

  @rolesController.ApiCreateRole()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  @Post()
  public async createOne(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createOne(dto);
  }

  @rolesController.ApiDeleteAllRoles()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.rolesService.deleteAll();
  }

  @rolesController.ApiDeleteOneRole()
  @UseGuards(JwtAccessGuard, RoleGuard)
  @Roles(ROLES.ADMIN)
  @Delete(':roleName')
  public async deleteOne(@Param('roleName') name: string): Promise<Role> {
    return this.rolesService.deleteOne(name);
  }
}
