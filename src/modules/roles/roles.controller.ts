import { RoleGuard } from '@/core/guards/role.guard';
import { ROLES } from '@/shared/constants/roles';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { CreateRoleDto } from './dto/create-role.dto';
import * as rolesController from './roles-controller-swagger.decorators';
import { RolesService } from './roles.service';

@ApiTags('Role')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @rolesController.ApiGetAllRoles()
  @UseGuards(AuthGuard('jwt-access'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @Get()
  public async getAll(): Promise<Role[]> {
    return this.rolesService.getAll();
  }

  @rolesController.ApiGetOneRole()
  @UseGuards(AuthGuard('jwt-access'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @Get(':roleName')
  public async getOne(@Param('roleName') name: string): Promise<Role> {
    return this.rolesService.getOne({ name });
  }

  @rolesController.ApiCreateRole()
  @UseGuards(AuthGuard('jwt-access'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @Post()
  public async createOne(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createOne(dto);
  }

  @rolesController.ApiDeleteAllRoles()
  @UseGuards(AuthGuard('jwt-access'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @Delete()
  public async deleteAll(): Promise<unknown> {
    return this.rolesService.deleteAll();
  }

  @rolesController.ApiDeleteOneRole()
  @UseGuards(AuthGuard('jwt-access'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @Delete(':roleName')
  public async deleteOne(@Param('roleName') name: string): Promise<Role> {
    return this.rolesService.deleteOne(name);
  }
}
