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
