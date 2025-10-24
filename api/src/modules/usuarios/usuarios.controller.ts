import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import UsuarioDTO from './dto/usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuarioService) {}

  @Get('listar-todos')
  async listar(){
    return await this.usuariosService.CarregarTodos();
  }

  @Post('gravar')
  async Criar(@Body() data: UsuarioDTO) {
    return await this.usuariosService.Gravar(data);
  }

  @Get('deletar/:id')
  async Deletar(@Param('id') id: number) {
    return await this.usuariosService.Deletar(id);
  }

  @Get('carregar-por-hash/:hash')
  async CarregarPorHash(@Param('hash') hash: string) {
    return await this.usuariosService.CarregarPorHash(hash);
  }

}
