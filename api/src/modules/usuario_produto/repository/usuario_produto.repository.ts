import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import UsuarioProdutoDTO from "../dto/usuario_produto.dto";

@Injectable() 
export class UsuarioProdutoRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async CarregarTodos() {
        return await this.prisma.usuarioProduto.findMany();
    }

    async CarregarPorId(id: number) {
        return await this.prisma.usuarioProduto.findUnique({
            where: {
                id_usuario_produto: id
            }
        });
    }

    async Criar(data: UsuarioProdutoDTO) {
        return await this.prisma.usuarioProduto.create({
            data
        });
    }

    async Atualizar(data: UsuarioProdutoDTO) {
        return await this.prisma.usuarioProduto.update({
            where: {
                id_usuario_produto: data.id_usuario_produto
            },
            data
        });
    }

    async Deletar(id: number) {
        return await this.prisma.usuarioProduto.delete({
            where: {
                id_usuario_produto: id
            }
        });
    }

    async CarregarPorUsuario(usuarioId: number) {
        return await this.prisma.usuarioProduto.findMany({
            where: {
                id_usuario: usuarioId
            }
        });
    }

    async CarregarPorProduto(produtoId: number) {
        return await this.prisma.usuarioProduto.findMany({
            where: {
                id_produto: produtoId
            }
        });
    }

    async CarregarPorUsuarioEProduto(id_usuario: number, id_produto: number) {
        return await this.prisma.usuarioProduto.findFirst({
            where: {
                id_usuario,
                id_produto,
            },
        });
    }

    async CarregarProdutoPorId(produtoId: number) {
        return await this.prisma.produto.findUnique({
            where: { id_produto: produtoId },
        });
    }
}