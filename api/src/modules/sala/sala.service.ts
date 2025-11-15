import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SalaRepository } from "./repository/sala.repository";
import { CriarSalaDTO, EntrarSalaDTO, SairSalaDTO, AtualizarStatusSalaDTO } from "./dto/sala.dto";
import Utilitarios from "src/classes/Utilitarios";
import { SalaGateway } from "./sala.gateway";

@Injectable()
export class SalaService {
  constructor(private salaRepository: SalaRepository, private salaGateway: SalaGateway) {}

  async Listar() {
    return await this.salaRepository.Listar();
  }

  async CarregarPorCodigo(codigo: string) {
    const sala = await this.salaRepository.CarregarPorCodigo(codigo);
    if (!sala) throw new NotFoundException("Sala não encontrada");
    return sala;
  }

  async Criar(data: CriarSalaDTO) {
    if (!data.id_host) throw new BadRequestException("Host não informado");
    const codigo = (data.codigo && data.codigo.trim().toLowerCase()) || Utilitarios.GerarHash().substring(0, 6);
    // Verifica se já existe
    const existente = await this.salaRepository.CarregarPorCodigo(codigo);
    if (existente) throw new BadRequestException("Código de sala já em uso");
    const sala = await this.salaRepository.CriarSala(codigo, data.id_host);
    // Adiciona o host como jogador
    await this.salaRepository.EntrarSala(sala.id_sala, data.id_host, 'host');
    const final = await this.salaRepository.CarregarPorCodigo(codigo);
    if (final) {
      this.salaGateway.broadcastSalaUpdate(codigo, final.status, await this.salaRepository.ContarJogadores(final.id_sala));
    }
    return final;
  }

  async Entrar(data: EntrarSalaDTO) {
    const sala = await this.salaRepository.CarregarPorCodigo(data.codigo);
    if (!sala) throw new NotFoundException("Sala não encontrada");

    const count = await this.salaRepository.ContarJogadores(sala.id_sala);
    if (count >= 2) throw new BadRequestException("Sala cheia");

    await this.salaRepository.EntrarSala(sala.id_sala, data.id_usuario, data.papel ?? 'client');

    // Atualiza status para in_progress quando tem 2 jogadores
    const novoCount = await this.salaRepository.ContarJogadores(sala.id_sala);
    if (novoCount >= 2 && sala.status !== 'in_progress') {
      await this.salaRepository.AtualizarStatus(sala.id_sala, 'in_progress');
    }

    const final = await this.salaRepository.CarregarPorCodigo(data.codigo);
    if (final) {
      this.salaGateway.broadcastSalaUpdate(data.codigo, final.status, await this.salaRepository.ContarJogadores(final.id_sala));
    }
    return final;
  }

  async Sair(data: SairSalaDTO) {
    const sala = await this.salaRepository.CarregarPorCodigo(data.codigo);
    if (!sala) throw new NotFoundException("Sala não encontrada");
    await this.salaRepository.SairSala(sala.id_sala, data.id_usuario);

    const count = await this.salaRepository.ContarJogadores(sala.id_sala);
    if (count === 0) {
      // Exclui sala quando não houver jogadores e notifica front
      await this.salaRepository.ExcluirSala(sala.id_sala);
      this.salaGateway.broadcastSalaDeleted(data.codigo);
      return null;
    } else if (count === 1 && sala.status !== 'waiting') {
      await this.salaRepository.AtualizarStatus(sala.id_sala, 'waiting');
    }

    const final = await this.salaRepository.CarregarPorCodigo(data.codigo);
    if (final) {
      this.salaGateway.broadcastSalaUpdate(data.codigo, final.status, await this.salaRepository.ContarJogadores(final.id_sala));
    }
    return final;
  }
}