import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoDTO } from './dto/produto.dto';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get('listar-todos')
  async listar(){
    return await this.produtoService.CarregarTodos();
  }

  @Post('gravar')
  async Criar(@Body() data: ProdutoDTO) {
    return await this.produtoService.Gravar(data);
  }

  @Delete('deletar/:id')
  async Deletar(@Param('id') id: string) {
    return await this.produtoService.Deletar(+id);
  }

  @Get('carregar-por-nome/:nome')
  async CarregarPorNome(@Param('nome') nome: string) {
    return await this.produtoService.CarregarPorNome(nome);
  }

}
