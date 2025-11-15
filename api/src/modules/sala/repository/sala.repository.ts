import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { sala_status } from "@prisma/client";

@Injectable()
export class SalaRepository {
  constructor(private prisma: PrismaService) {}

  async CriarSala(codigo: string, id_host: number) {
    return await this.prisma.sala.create({
      data: {
        codigo,
        id_host,
        status: "waiting",
      },
    });
  }

  async CarregarPorCodigo(codigo: string) {
    return await this.prisma.sala.findUnique({
      where: { codigo },
      include: {
        // Inclui apenas o campo "imagem" do Produto (skin ativa) para evitar BigInt na resposta
        SalaJogador: {
          include: {
            Usuario: {
              include: {
                Produto_Usuario_skin_ativaToProduto: {
                  select: { imagem: true, extensao: true }
                },
                Produto_Usuario_cenario_ativoToProduto: {
                  select: { imagem: true, extensao: true }
                },
                Produto_Usuario_poder_ativo1ToProduto: {
                  select: { id_produto: true, nome: true, imagem: true, extensao: true }
                },
                Produto_Usuario_poder_ativo2ToProduto: {
                  select: { id_produto: true, nome: true, imagem: true, extensao: true }
                },
                Produto_Usuario_poder_ativo3ToProduto: {
                  select: { id_produto: true, nome: true, imagem: true, extensao: true }
                }
              }
            }
          }
        },
        Usuario: {
          include: {
            Produto_Usuario_skin_ativaToProduto: {
              select: { imagem: true, extensao: true }
            },
            Produto_Usuario_cenario_ativoToProduto: {
              select: { imagem: true, extensao: true }
            },
            Produto_Usuario_poder_ativo1ToProduto: {
              select: { id_produto: true, nome: true, imagem: true, extensao: true }
            },
            Produto_Usuario_poder_ativo2ToProduto: {
              select: { id_produto: true, nome: true, imagem: true, extensao: true }
            },
            Produto_Usuario_poder_ativo3ToProduto: {
              select: { id_produto: true, nome: true, imagem: true, extensao: true }
            }
          }
        },
      },
    });
  }

  async Listar() {
    return await this.prisma.sala.findMany({
      include: { SalaJogador: true },
      orderBy: { created_at: "desc" },
    });
  }

  async ContarJogadores(id_sala: number) {
    return await this.prisma.salaJogador.count({ where: { id_sala } });
  }

  async EntrarSala(id_sala: number, id_usuario: number, papel: 'host' | 'client' = 'client') {
    // Garante unicidade por sala/usuario
    return await this.prisma.salaJogador.upsert({
      where: {
        id_sala_id_usuario: { id_sala, id_usuario },
      },
      update: { conectado: true },
      create: {
        id_sala,
        id_usuario,
        conectado: true,
      },
    });
  }

  async SairSala(id_sala: number, id_usuario: number) {
    return await this.prisma.salaJogador.delete({
      where: {
        id_sala_id_usuario: { id_sala, id_usuario },
      },
    });
  }

  async AtualizarStatus(id_sala: number, status: sala_status) {
    return await this.prisma.sala.update({
      where: { id_sala },
      data: { status },
    });
  }

  async ExcluirSala(id_sala: number) {
    return await this.prisma.sala.delete({ where: { id_sala } });
  }
}