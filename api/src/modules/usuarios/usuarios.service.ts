import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UsuarioRepository } from "./repository/usuario.repository";
import UsuarioDTO from "./dto/usuario.dto";
import Utilitarios from "../../classes/Utilitarios";
import LoginDTO from "./dto/login.dto";
import { ProdutoService } from "../produto/produto.service";
import { UsuarioProdutoService } from "../usuario_produto/usuario_produto.service";

@Injectable()
export class UsuarioService {
    constructor(
        private usuarioRepository: UsuarioRepository,
        private produtoService: ProdutoService,
        private usuarioProdutoService: UsuarioProdutoService,
    ){}

    async CarregarTodos() {
        return await this.usuarioRepository.CarregarTodos();
    }

    async Gravar(data: UsuarioDTO) {

        if (data.id_usuario) {
            return await this.Atualizar(data);
        }
    
        return await this.Criar(data);
    }

    async Criar(data: UsuarioDTO) {
        if (!data.senha) throw new BadRequestException("Senha não informada")

        data.hash_id = Utilitarios.GerarHash();
        data.senha = await Utilitarios.GerarHashSenha(data.senha);

        // Cria usuário
        const usuario = await this.usuarioRepository.Criar(data);

        // Atribui itens padrão: Skin Default (tipo 2) e Cenário Default (tipo 3)
        try {
            const skinDefault = await this.produtoService.CarregarPorNomeETipo("Default", 2);
            const cenarioDefault = await this.produtoService.CarregarPorNomeETipo("Default", 3);

            // Concede ao usuário, se existirem
            if (skinDefault?.id_produto) {
                await this.usuarioProdutoService.Criar({
                    id_usuario: usuario.id_usuario,
                    id_produto: skinDefault.id_produto,
                    quantidade: null,
                    id_usuario_produto: undefined as any, // não usado na criação
                } as any);
            }
            if (cenarioDefault?.id_produto) {
                await this.usuarioProdutoService.Criar({
                    id_usuario: usuario.id_usuario,
                    id_produto: cenarioDefault.id_produto,
                    quantidade: null,
                    id_usuario_produto: undefined as any,
                } as any);
            }

            // Marca como ativos no usuário
            const atualizado: UsuarioDTO = {
                ...usuario,
                skin_ativa: skinDefault?.id_produto ?? usuario.skin_ativa ?? null,
                cenario_ativo: cenarioDefault?.id_produto ?? usuario.cenario_ativo ?? null,
            } as UsuarioDTO;
            return await this.usuarioRepository.Atualizar(atualizado);
        } catch (_) {
            // Em caso de falha ao atribuir itens padrão, retorna usuário criado sem alteração
            return usuario;
        }
    }

    async Deletar(id: number) {
        return await this.usuarioRepository.Deletar(id);
    }

    async Atualizar(data: UsuarioDTO) {
        return await this.usuarioRepository.Atualizar(data);
    }

    async CarregarPorHash(hash: string) {
        const usuario = await this.usuarioRepository.CarregarPorHash(hash);

        if (!usuario) throw new NotFoundException("Usuário não encontrado");

        return usuario;
    }

    async Login(data: LoginDTO) {
        if (!data.email || !data.senha) throw new BadRequestException("Email e senha são obrigatórios");
        const senhaHash = await Utilitarios.GerarHashSenha(data.senha);
        const usuario = await this.usuarioRepository.CarregarPorEmailSenha(data.email, senhaHash);
        if (!usuario) throw new UnauthorizedException("Credenciais inválidas");
        return usuario;
    }

}