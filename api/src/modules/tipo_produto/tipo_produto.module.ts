import { Module } from '@nestjs/common';
import { TipoProdutoService } from './tipo_produto.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TipoProdutoController } from './tipo_produto.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TipoProdutoController],
  providers: [TipoProdutoService],
})
export class TipoProdutoModule {}
