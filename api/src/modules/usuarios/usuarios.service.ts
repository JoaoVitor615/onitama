import { BadRequestException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { UsuarioRepository } from "./repository/usuario.repository";
import UsuarioDTO from "./dto/usuario.dto";
import Utilitarios from "../../classes/Utilitarios";

@Injectable()
export class UsuarioService {
    constructor(
        private usuarioRepository: UsuarioRepository
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

        return await this.usuarioRepository.Criar(data);
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

}