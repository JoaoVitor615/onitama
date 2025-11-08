import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SalaService } from "./sala.service";
import { AtualizarStatusSalaDTO, CriarSalaDTO, EntrarSalaDTO, SairSalaDTO } from "./dto/sala.dto";

@Controller('salas')
export class SalaController {
  constructor(private readonly salaService: SalaService) {}

  @Get('listar')
  async listar() {
    return await this.salaService.Listar();
  }

  @Get('carregar-por-codigo/:codigo')
  async carregarPorCodigo(@Param('codigo') codigo: string) {
    return await this.salaService.CarregarPorCodigo(codigo);
  }

  @Post('criar')
  async criar(@Body() data: CriarSalaDTO) {
    return await this.salaService.Criar(data);
  }

  @Post('entrar')
  async entrar(@Body() data: EntrarSalaDTO) {
    return await this.salaService.Entrar(data);
  }

  @Post('sair')
  async sair(@Body() data: SairSalaDTO) {
    return await this.salaService.Sair(data);
  }
}