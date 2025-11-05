import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoProdutoService } from './tipo_produto.service';
import { TipoProdutoDTO } from './dto/tipo_produto.dto';

@Controller('tipo-produto')
export class TipoProdutoController {
  constructor(private readonly tipoProdutoService: TipoProdutoService) {}

  @Get('listar-todos')
  async listar(){
    return await this.tipoProdutoService.CarregarTodos();
  }

  @Post('gravar')
  async Criar(@Body() data: TipoProdutoDTO) {
    return await this.tipoProdutoService.Gravar(data);
  }

  @Delete('deletar/:id')
  async Deletar(@Param('id') id: string) {
    return await this.tipoProdutoService.Deletar(+id);
  }

  @Get('carregar-por-nome/:nome')
  async CarregarPorNome(@Param('nome') nome: string) {
    return await this.tipoProdutoService.CarregarPorNome(nome);
  }

}