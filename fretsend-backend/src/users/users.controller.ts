import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto} from './users.dto';
import { Roles, CurrentUser } from '../common/decorators/index';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'agency_manager')
  @ApiOperation({ summary: 'Liste des utilisateurs' })
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  // Check if user exists by email (for package creation)
  @Get('check')
  @Roles('admin', 'agency_manager', 'agent')
  @ApiOperation({ summary: 'Vérifier si un client existe par email' })
  checkByEmail(@Query('email') email: string) {
    return this.usersService.checkByEmail(email);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Modifier son propre profil' })
  updateSelf(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateSelf(userId, dto);
  }

  @Get(':id')
  @Roles('admin', 'agency_manager')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
