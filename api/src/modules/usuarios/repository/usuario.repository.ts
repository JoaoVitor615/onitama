import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import UsuarioDTO from "../dto/usuario.dto";

@Injectable() 
export class UsuarioRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async CarregarTodos() {
        return await this.prisma.usuario.findMany();
    }

    async Criar(data: UsuarioDTO) {
        return await this.prisma.usuario.create({
            data
        })
    }

    async Atualizar(data: UsuarioDTO) {
        return await this.prisma.usuario.update({
            where: {
                id_usuario: data.id_usuario
            },
            data
        })
    }

    async Deletar(id: number) {
        return await this.prisma.usuario.delete({
            where: {
                id_usuario: id
            }
        })
    }

    async CarregarPorHash(hash: string) {
        return await this.prisma.usuario.findFirst({
            where: {
                hash_id: hash
            }
        })
    }

    async CarregarPorEmail(email: string) {
        return await this.prisma.usuario.findFirst({
            where: { email }
        });
    }

    async CarregarPorEmailSenha(email: string, senhaHash: string) {
        return await this.prisma.usuario.findFirst({
            where: { email, senha: senhaHash }
        });
    }


}