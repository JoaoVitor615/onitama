import { BadRequestException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { UsuarioProdutoRepository } from "./repository/usuario_produto.repository";
import UsuarioProdutoDTO from "./dto/usuario_produto.dto";

@Injectable()
export class UsuarioProdutoService {
    constructor(
        private usuarioProdutoRepository: UsuarioProdutoRepository
    ){}

    async CarregarTodos() {
        return await this.usuarioProdutoRepository.CarregarTodos();
    }

    async CarregarPorId(id: number) {
        const usuarioProduto = await this.usuarioProdutoRepository.CarregarPorId(id);
        
        if (!usuarioProduto) throw new NotFoundException("Relação usuário-produto não encontrada");
        
        return usuarioProduto;
    }

    async Gravar(data: UsuarioProdutoDTO) {
        if (data.id_usuario_produto) {
            return await this.Atualizar(data);
        }
    
        return await this.Criar(data);
    }

    async Criar(data: UsuarioProdutoDTO) {
        if (!data.id_usuario) throw new BadRequestException("ID do usuário não informado");
        if (!data.id_produto) throw new BadRequestException("ID do produto não informado");
        // Carrega tipo do produto para verificar se é um poder (id_tipo_produto = 4)
        const produto = await this.usuarioProdutoRepository.CarregarProdutoPorId(data.id_produto);
        const tipo = produto?.id_tipo_produto != null ? Number(produto.id_tipo_produto) : null;

        if (tipo === 4) {
            // Poder: incrementar quantidade caso já possua, senão criar com quantidade = 1
            const existente = await this.usuarioProdutoRepository.CarregarPorUsuarioEProduto(data.id_usuario, data.id_produto);
            if (existente) {
                const novaQuantidade = (existente.quantidade ?? 0) + 1;
                // Garante tipos não nulos para o DTO esperado pelo update
                if (existente.id_usuario == null || existente.id_produto == null) {
                    throw new BadRequestException("Relação usuário-produto inválida para atualização");
                }
                return await this.usuarioProdutoRepository.Atualizar({
                    id_usuario_produto: existente.id_usuario_produto,
                    id_usuario: Number(existente.id_usuario),
                    id_produto: Number(existente.id_produto),
                    quantidade: novaQuantidade,
                });
            }
            return await this.usuarioProdutoRepository.Criar({
                ...data,
                quantidade: 1,
            });
        }

        // Demais tipos: criar relação simples (quantidade não utilizada)
        return await this.usuarioProdutoRepository.Criar(data);
    }

    async Deletar(id: number) {
        return await this.usuarioProdutoRepository.Deletar(id);
    }

    async Atualizar(data: UsuarioProdutoDTO) {
        if (!data.id_usuario_produto) throw new BadRequestException("ID da relação usuário-produto não informado");
        
        return await this.usuarioProdutoRepository.Atualizar(data);
    }

    async CarregarPorUsuario(usuarioId: number) {
        return await this.usuarioProdutoRepository.CarregarPorUsuario(usuarioId);
    }

    async CarregarPorProduto(produtoId: number) {
        return await this.usuarioProdutoRepository.CarregarPorProduto(produtoId);
    }
}
