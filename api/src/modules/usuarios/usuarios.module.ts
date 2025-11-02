import { Module } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsuarioRepository } from './repository/usuario.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosController],
  providers: [UsuarioService, UsuarioRepository],
  exports: [UsuarioService, UsuarioRepository]
})
export class UsuariosModule {}
