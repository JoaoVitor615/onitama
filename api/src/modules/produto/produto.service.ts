import { BadRequestException, Injectable } from '@nestjs/common';
import { ProdutoRepository } from './repository/produto.repository';
import { ProdutoDto } from './dto/produto.dto';

@Injectable()
export class ProdutoService {
  constructor(
    private produtoRepository: ProdutoRepository
  )
{}

   async CarregarTodos() {
        return await this.produtoRepository.CarregarTodos();
    }

    async Gravar(data: ProdutoDto) {

        if (data.id_produto) {
            return await this.Atualizar(data);
        }
    
        return await this.Criar(data);
    }

    async Criar(data: ProdutoDto) {
        if (!data.nome) throw new BadRequestException("Nome de produto não informado")
        return await this.produtoRepository.Criar(data);
    }

    async Deletar(id: number) {
        return await this.produtoRepository.Deletar(id);
    }

    async Atualizar(data: ProdutoDto) {
        return await this.produtoRepository.Atualizar(data);
    }

    async CarregarPorNome(nome: string) {
        return await this.produtoRepository.CarregarPorNome(nome);
    }

}