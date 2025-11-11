import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

type PresenceEntry = { userId: number };

@WebSocketGateway({ namespace: '/salas', cors: { origin: true, credentials: true } })
@Injectable()
export class SalaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(SalaGateway.name);
  private presenceByCodigo: Map<string, Map<string, PresenceEntry>> = new Map();
  private gameStateByCodigo: Map<string, any> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /** Lista */
  @SubscribeMessage('subscribe_lista')
  handleSubscribeLista(@ConnectedSocket() client: Socket) {
    client.join('lista');
    client.emit('lista_subscribed', { ok: true });
  }

  /** Sala específica */
  @SubscribeMessage('join_sala')
  handleJoinSala(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { codigo: string; userId?: number }
  ) {
    const codigo = (data?.codigo || '').trim().toLowerCase();
    if (!codigo) return client.emit('error', { message: 'Código inválido' });
    client.join(`sala:${codigo}`);
    client.data.codigo = codigo;
    if (data?.userId) client.data.userId = data.userId;

    // registra presença
    const roomMap = this.presenceByCodigo.get(codigo) || new Map<string, PresenceEntry>();
    roomMap.set(client.id, { userId: data?.userId ?? 0 });
    this.presenceByCodigo.set(codigo, roomMap);
    this.broadcastPresence(codigo);
    client.emit('joined_sala', { codigo });
    // envia estado de jogo atual se existir
    const existing = this.gameStateByCodigo.get(codigo);
    if (existing) {
      client.emit('game_state', { codigo, state: existing });
    } else {
      // tenta carregar do banco se não houver em memória
      this.prisma.sala.findUnique({ where: { codigo }, select: { game_state: true } })
        .then((res) => {
          if (res && res.game_state != null) {
            this.gameStateByCodigo.set(codigo, res.game_state as any);
            client.emit('game_state', { codigo, state: res.game_state });
          }
        })
        .catch((err) => {
          this.logger.warn(`Falha ao carregar game_state do banco para sala ${codigo}: ${String(err)}`);
        });
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Socket conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const codigo: string | undefined = client.data?.codigo;
    if (codigo) {
      const roomMap = this.presenceByCodigo.get(codigo);
      if (roomMap) {
        roomMap.delete(client.id);
        if (roomMap.size === 0) this.presenceByCodigo.delete(codigo);
        else this.presenceByCodigo.set(codigo, roomMap);
        this.broadcastPresence(codigo);
      }
    }
    this.logger.log(`Socket desconectado: ${client.id}`);
  }

  /** Emite atualização de presença para lista e sala */
  broadcastPresence(codigo: string) {
    const presentes = this.getPresenceCount(codigo);
    const payload = { codigo, presentes };
    this.server.to('lista').emit('presence_update', payload);
    this.server.to(`sala:${codigo}`).emit('presence_update', payload);
  }

  /** Emite atualização de sala (status/contagem) para lista e sala */
  broadcastSalaUpdate(codigo: string, status: string, totalJogadores: number) {
    const presentes = this.getPresenceCount(codigo);
    const payload = { codigo, status, totalJogadores, presentes };
    this.server.to('lista').emit('room_update', payload);
    this.server.to(`sala:${codigo}`).emit('room_update', payload);
  }

  /** Emite remoção de sala para atualizar a lista no front */
  broadcastSalaDeleted(codigo: string) {
    this.server.to('lista').emit('room_deleted', { codigo });
    this.server.to(`sala:${codigo}`).emit('room_deleted', { codigo });
  }

  /** Recebe e retransmite estado de jogo (sem validação, por ora) */
  @SubscribeMessage('game_state')
  handleGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { codigo: string; state: any }
  ) {
    const codigo = (data?.codigo || '').trim().toLowerCase();
    if (!codigo) return;
    this.gameStateByCodigo.set(codigo, data?.state);
    this.server.to(`sala:${codigo}`).emit('game_state', { codigo, state: data?.state });
    // persiste no banco (não bloqueia resposta WS)
    this.prisma.sala.update({ where: { codigo }, data: { game_state: data?.state as any } })
      .catch((err) => {
        this.logger.warn(`Falha ao persistir game_state para sala ${codigo}: ${String(err)}`);
      });
  }

  getPresenceCount(codigo: string): number {
    const roomMap = this.presenceByCodigo.get(codigo);
    return roomMap ? roomMap.size : 0;
  }
}