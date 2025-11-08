import { BadRequestException, Injectable } from '@nestjs/common';
import { TipoProdutoRepository } from './repository/tipo_produto.repository';
import { TipoProdutoDTO } from './dto/tipo_produto.dto';

@Injectable()
export class TipoProdutoService {
  constructor(
    private tipoProdutoRepository: TipoProdutoRepository
  )
{}

   async CarregarTodos() {
        return await this.tipoProdutoRepository.CarregarTodos();
    }

    async Gravar(data: TipoProdutoDTO) {

        if (data.id_tipo_produto) {
            return await this.Atualizar(data);
        }
    
        return await this.Criar(data);
    }

    async Criar(data: TipoProdutoDTO) {
        if (!data.nome) throw new BadRequestException("Nome do tipo de produto não informado")
        return await this.tipoProdutoRepository.Criar(data);
    }

    async Deletar(id: number) {
        return await this.tipoProdutoRepository.Deletar(id);
    }

    async Atualizar(data: TipoProdutoDTO) {
        return await this.tipoProdutoRepository.Atualizar(data);
    }

    async CarregarPorNome(nome: string) {
        return await this.tipoProdutoRepository.CarregarPorNome(nome);
    }

}