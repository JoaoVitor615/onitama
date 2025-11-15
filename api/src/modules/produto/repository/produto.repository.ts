import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ProdutoDTO } from "../dto/produto.dto";

@Injectable() 
export class ProdutoRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async Criar(data: ProdutoDTO) {
        return await this.prisma.produto.create({
            data
        })
    }

        async CarregarTodos() {
            const list = await this.prisma.produto.findMany();
            // Converte BigInt (id_tipo_produto) para number para evitar erro de serialização
            return list.map((p: any) => ({
                ...p,
                id_tipo_produto: p?.id_tipo_produto != null ? Number(p.id_tipo_produto) : null,
            }));
        }
    
    
        async Atualizar(data: ProdutoDTO) {
            return await this.prisma.produto.update({
                where: {
                    id_produto: data.id_produto
                },
                data
            })
        }
    
        async Deletar(id: number) {
            return await this.prisma.produto.delete({
                where: {
                    id_produto: id
                }
            })
        }
    
        async CarregarPorNome(nome: string) {
            return await this.prisma.produto.findFirst({
                where: {
                    nome: nome.toLowerCase()
                }
            })
        }
    
}