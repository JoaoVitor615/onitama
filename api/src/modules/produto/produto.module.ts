import { Module } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoController } from './produto.controller';
import { ProdutoRepository } from './repository/produto.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProdutoController],
  providers: [ProdutoService, ProdutoRepository],
  exports: [ProdutoService, ProdutoRepository]
})
export class ProdutoModule {}
