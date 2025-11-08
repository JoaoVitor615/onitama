import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { SalaService } from "./sala.service";
import { SalaController } from "./sala.controller";
import { SalaRepository } from "./repository/sala.repository";

@Module({
  imports: [PrismaModule],
  controllers: [SalaController],
  providers: [SalaService, SalaRepository],
  exports: [SalaService, SalaRepository],
})
export class SalaModule {}