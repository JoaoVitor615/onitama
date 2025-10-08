import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import UsuarioDTO from "../dto/usuario.dto";

@Injectable() 
export class UsuarioRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async CarregarTodos() {
        return await this.prisma.usuario.findFirst({
            where: {
                email: "nicolaslongo18@gmail.com"
            }
        });
    }

    

}