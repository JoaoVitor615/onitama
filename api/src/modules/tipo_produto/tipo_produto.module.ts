import { Module } from '@nestjs/common';
import { TipoProdutoService } from './tipo_produto.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TipoProdutoController } from './tipo_produto.controller';
import { TipoProdutoRepository } from './repository/tipo_produto.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TipoProdutoController],
  providers: [TipoProdutoService, TipoProdutoRepository],
  exports: [TipoProdutoService, TipoProdutoRepository]
})
export class TipoProdutoModule {}
