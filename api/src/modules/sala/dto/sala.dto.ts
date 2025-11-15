import { sala_status } from "@prisma/client";

export class CriarSalaDTO {
  codigo?: string; // opcional; gerado se não informado
  id_host!: number; // obtido dos headers no controller
}

export class EntrarSalaDTO {
  codigo!: string;
  id_usuario!: number;
  papel?: 'host' | 'client';
}

export class SairSalaDTO {
  codigo!: string;
  id_usuario!: number;
}

export class AtualizarStatusSalaDTO {
  codigo!: string;
  status!: sala_status;
}