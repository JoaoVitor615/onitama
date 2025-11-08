import { Usuario } from "@prisma/client";

export default class UsuarioDTO implements Usuario {
    id_usuario: number;
    hash_id: string | null;
    data_criacao: Date;
    email: string | null;
    senha: string | null;
    moedas: number | null;
    apelido: string | null;
    skin_ativa: number | null;
    cenario_ativo: number | null;
    poder_ativo1: number | null;
    poder_ativo2: number | null;
    poder_ativo3: number | null;
}