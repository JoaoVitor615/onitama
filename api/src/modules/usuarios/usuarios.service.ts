import { Injectable } from "@nestjs/common";
import { UsuarioRepository } from "./repository/usuario.repository";

@Injectable()
export class UsuarioService {
    constructor(
        private usuarioRepository: UsuarioRepository
    ){}

    async CarregarTodos() {
        const result = await this.usuarioRepository.CarregarTodos();
        console.log(result);
        return result;
    }

}