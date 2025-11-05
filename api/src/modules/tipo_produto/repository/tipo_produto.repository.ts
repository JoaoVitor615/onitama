import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TipoProdutoDTO } from "../dto/tipo_produto.dto";

@Injectable() 
export class TipoProdutoRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async Criar(data: TipoProdutoDTO) {
        return await this.prisma.tipoProduto.create({
            data
        })
    }

        async CarregarTodos() {
            return await this.prisma.tipoProduto.findMany();
        }
    
    
        async Atualizar(data: TipoProdutoDTO) {
            return await this.prisma.tipoProduto.update({
                where: {
                    id_tipo_produto: data.id_tipo_produto
                },
                data
            })
        }
    
        async Deletar(id: number) {
            return await this.prisma.tipoProduto.delete({
                where: {
                    id_tipo_produto: id
                }
            })
        }
    
        async CarregarPorNome(nome: string) {
            return await this.prisma.tipoProduto.findFirst({
                where: {
                    nome: nome.toLowerCase()
                }
            })
        }
    
}