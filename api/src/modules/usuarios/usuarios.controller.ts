import { Controller, Get } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuarioService) {}

  @Get('listar_todos')
  async listar(){
    return await this.usuariosService.CarregarTodos();
  }
}
