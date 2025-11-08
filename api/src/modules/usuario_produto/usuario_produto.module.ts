import { Module } from '@nestjs/common';
import { UsuarioProdutoService } from './usuario_produto.service';
import { UsuarioProdutoController } from './usuario_produto.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsuarioProdutoRepository } from './repository/usuario_produto.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioProdutoController],
  providers: [UsuarioProdutoService, UsuarioProdutoRepository],
  exports: [UsuarioProdutoService, UsuarioProdutoRepository]
})
export class UsuarioProdutoModule {}
