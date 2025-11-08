import { TipoProduto } from "@prisma/client";

export class TipoProdutoDTO implements TipoProduto{
    id_tipo_produto: bigint;
    nome: string;
}