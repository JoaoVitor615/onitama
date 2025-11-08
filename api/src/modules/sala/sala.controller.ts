import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from "@nestjs/common";
import { SalaService } from "./sala.service";
import { AtualizarStatusSalaDTO, CriarSalaDTO, EntrarSalaDTO, SairSalaDTO } from "./dto/sala.dto";
import { UsuarioService } from "../usuarios/usuarios.service";

@Controller('salas')
export class SalaController {
  constructor(
    private readonly salaService: SalaService,
    private readonly usuarioService: UsuarioService
  ) {}

  @Get('listar')
  async listar() {
    return await this.salaService.Listar();
  }

  @Get('carregar-por-codigo/:codigo')
  async carregarPorCodigo(@Param('codigo') codigo: string) {
    return await this.salaService.CarregarPorCodigo(codigo);
  }

  @Post('criar')
  async criar(
    @Body() data: CriarSalaDTO,
    @Headers('x-usuario-id') idHeader?: string,
    @Headers('x-usuario-hash') hashHeader?: string,
  ) {
    const id = idHeader ? Number(idHeader) : undefined;
    if (!id || !hashHeader) throw new UnauthorizedException('Usuário não autenticado');
    const usuario = await this.usuarioService.CarregarPorHash(hashHeader);
    if (!usuario || usuario.id_usuario !== id) throw new UnauthorizedException('Cabeçalhos de usuário inválidos');

    const payload: CriarSalaDTO = {
      codigo: data?.codigo,
      id_host: id,
    };
    return await this.salaService.Criar(payload);
  }

  @Post('entrar')
  async entrar(
    @Body() data: EntrarSalaDTO,
    @Headers('x-usuario-id') idHeader?: string,
    @Headers('x-usuario-hash') hashHeader?: string,
  ) {
    const id = idHeader ? Number(idHeader) : undefined;
    if (!id || !hashHeader) throw new UnauthorizedException('Usuário não autenticado');
    const usuario = await this.usuarioService.CarregarPorHash(hashHeader);
    if (!usuario || usuario.id_usuario !== id) throw new UnauthorizedException('Cabeçalhos de usuário inválidos');

    const payload: EntrarSalaDTO = {
      codigo: data.codigo,
      id_usuario: id,
      papel: 'client',
    };
    return await this.salaService.Entrar(payload);
  }

  @Post('sair')
  async sair(
    @Body() data: SairSalaDTO,
    @Headers('x-usuario-id') idHeader?: string,
    @Headers('x-usuario-hash') hashHeader?: string,
  ) {
    const id = idHeader ? Number(idHeader) : undefined;
    if (!id || !hashHeader) throw new UnauthorizedException('Usuário não autenticado');
    const usuario = await this.usuarioService.CarregarPorHash(hashHeader);
    if (!usuario || usuario.id_usuario !== id) throw new UnauthorizedException('Cabeçalhos de usuário inválidos');
    const payload: SairSalaDTO = { codigo: data.codigo, id_usuario: id };
    return await this.salaService.Sair(payload);
  }
}