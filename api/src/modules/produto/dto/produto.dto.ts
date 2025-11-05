import { Produto } from "@prisma/client";

export class ProdutoDTO implements Produto {
    id_produto: number;
    nome: string;
    preco: number | null;
    compravel: boolean | null;
    xp_min: number | null;
    id_tipo_produto: bigint | null;
}
