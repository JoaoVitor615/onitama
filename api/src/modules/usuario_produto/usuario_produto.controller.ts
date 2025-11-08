import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsuarioProdutoService } from './usuario_produto.service';
import UsuarioProdutoDTO from './dto/usuario_produto.dto';

@Controller('usuario-produto')
export class UsuarioProdutoController {
  constructor(private readonly usuarioProdutoService: UsuarioProdutoService) {}

  @Get('listar-todos')
  async listar(){
    return await this.usuarioProdutoService.CarregarTodos();
  }

  @Get('carregar-por-id/:id')
  async CarregarPorId(@Param('id') id: string) {
    return await this.usuarioProdutoService.CarregarPorId(+id);
  }

  @Post('gravar')
  async Gravar(@Body() data: UsuarioProdutoDTO) {
    return await this.usuarioProdutoService.Gravar(data);
  }

  @Put('atualizar')
  async Atualizar(@Body() data: UsuarioProdutoDTO) {
    return await this.usuarioProdutoService.Atualizar(data);
  }

  @Delete('deletar/:id')
  async Deletar(@Param('id') id: string) {
    return await this.usuarioProdutoService.Deletar(+id);
  }

  @Get('carregar-por-usuario/:usuarioId')
  async CarregarPorUsuario(@Param('usuarioId') usuarioId: string) {
    return await this.usuarioProdutoService.CarregarPorUsuario(+usuarioId);
  }

  @Get('carregar-por-produto/:produtoId')
  async CarregarPorProduto(@Param('produtoId') produtoId: string) {
    return await this.usuarioProdutoService.CarregarPorProduto(+produtoId);
  }
}
