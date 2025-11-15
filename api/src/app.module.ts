import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TipoProdutoModule } from './modules/tipo_produto/tipo_produto.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { UsuarioProdutoModule } from './modules/usuario_produto/usuario_produto.module';
import { SalaModule } from './modules/sala/sala.module';

@Module({
  imports: [UsuariosModule, TipoProdutoModule, ProdutoModule, UsuarioProdutoModule, SalaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
