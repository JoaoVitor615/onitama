import { Produto } from "@prisma/client";

export class ProdutoDTO implements Produto {
    id_produto: number;
    nome: string;
    preco: number | null;
    compravel: boolean | null;
    id_tipo_produto: bigint | null;
    imagem: string | null;
    audio: string | null;
    extensao: string | null;
}
