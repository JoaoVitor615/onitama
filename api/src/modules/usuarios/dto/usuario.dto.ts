import { Usuario } from "@prisma/client";

export default class UsuarioDTO implements Usuario {
    id_usuario: number;
    hash_id: string | null;
    data_criacao: Date;
    email: string | null;
    senha: string | null;
    xp: number | null;
    pontos: number | null;
    moedas: number | null;
    id_banner: number | null;
    id_titulo: number | null;
    apelido: string | null;
}