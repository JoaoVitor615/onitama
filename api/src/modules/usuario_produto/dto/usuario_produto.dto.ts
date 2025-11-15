import { UsuarioProduto } from "@prisma/client";

export default class UsuarioProdutoDTO implements UsuarioProduto {
    id_usuario_produto: number;
    id_usuario: number;
    id_produto: number;
    quantidade: number | null;
}