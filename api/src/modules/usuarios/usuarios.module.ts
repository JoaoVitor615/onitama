import { Module } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsuarioRepository } from './repository/usuario.repository';
import { ProdutoModule } from '../produto/produto.module';
import { UsuarioProdutoModule } from '../usuario_produto/usuario_produto.module';

@Module({
  imports: [PrismaModule, ProdutoModule, UsuarioProdutoModule],
  controllers: [UsuariosController],
  providers: [UsuarioService, UsuarioRepository],
  exports: [UsuarioService, UsuarioRepository]
})
export class UsuariosModule {}
