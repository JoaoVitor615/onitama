import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // Em desenvolvimento na LAN, permita qualquer origem.
    // Em produção, restrinja a origens específicas.
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Usuario-Id', 'X-Usuario-Hash'],
  });
  // Adapter do Socket.IO para garantir CORS/coleta de sockets no mesmo servidor
  app.useWebSocketAdapter(new IoAdapter(app));
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  // Servidor WebSocket (RFC6455) para Godot (WebSocketPeer)
  const httpServer = app.getHttpServer();
  // Usa modo noServer para evitar conflitos com Socket.IO no mesmo HTTP server
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    try {
      const url = req.url || '';
      if (url.startsWith('/ws/onitama')) {
        wss.handleUpgrade(req, socket as any, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      } else {
        // Não processa outras rotas de upgrade aqui; deixa Socket.IO lidar
      }
    } catch (e) {
      try { socket.destroy(); } catch (_) {}
    }
  });

  const clientsByRoom = new Map<string, Set<WebSocket>>();
  const metaByClient = new WeakMap<WebSocket, { room: string; name: string }>();

  function sendJson(ws: WebSocket, payload: any) {
    try { ws.send(JSON.stringify(payload)); } catch (e) { /* noop */ }
  }
  function broadcast(room: string, payload: any, except?: WebSocket) {
    const set = clientsByRoom.get(room);
    if (!set) return;
    for (const client of set) {
      if (client !== except && client.readyState === WebSocket.OPEN) {
        sendJson(client, payload);
      }
    }
  }

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Conexão aceita de ${ip}`);

    ws.on('message', (raw) => {
      let data: any;
      try { data = JSON.parse(raw.toString()); } catch {
        return sendJson(ws, { type: 'error', message: 'invalid_json' });
      }
      const type = String(data?.type || '').trim();
      if (type === 'join') {
        const room = String(data?.room || '').trim().toLowerCase();
        const name = String(data?.name || 'Jogador');
        if (!room) return sendJson(ws, { type: 'error', message: 'room_required' });
        metaByClient.set(ws, { room, name });
        const set = clientsByRoom.get(room) || new Set<WebSocket>();
        set.add(ws);
        clientsByRoom.set(room, set);
        sendJson(ws, { type: 'joined', room, name });
        broadcast(room, { type: 'presence_update', room, presentes: set.size });
        console.log(`[WS] ${name} entrou na sala ${room}. Presentes: ${set.size}`);
      } else if (type === 'move') {
        const meta = metaByClient.get(ws);
        if (!meta) return;
        broadcast(meta.room, { type: 'move', room: meta.room, name: meta.name, move: data?.move }, ws);
      } else {
        // Ignora tipos desconhecidos por agora
      }
    });

    ws.on('close', () => {
      const meta = metaByClient.get(ws);
      if (!meta) return;
      const set = clientsByRoom.get(meta.room);
      if (set) {
        set.delete(ws);
        if (set.size === 0) clientsByRoom.delete(meta.room);
        else clientsByRoom.set(meta.room, set);
        broadcast(meta.room, { type: 'presence_update', room: meta.room, presentes: set.size });
        console.log(`[WS] ${meta.name} saiu da sala ${meta.room}. Presentes: ${set.size}`);
      }
    });
  });
}
bootstrap();
