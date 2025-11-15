import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { SalaService } from "./sala.service";
import { SalaController } from "./sala.controller";
import { SalaRepository } from "./repository/sala.repository";
import { UsuariosModule } from "../usuarios/usuarios.module";
import { SalaGateway } from "./sala.gateway";

@Module({
  imports: [PrismaModule, UsuariosModule],
  controllers: [SalaController],
  providers: [SalaService, SalaRepository, SalaGateway],
  exports: [SalaService, SalaRepository, SalaGateway],
})
export class SalaModule {}