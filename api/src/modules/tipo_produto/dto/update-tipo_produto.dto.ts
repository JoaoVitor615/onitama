import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoProdutoDto } from './create-tipo_produto.dto';

export class UpdateTipoProdutoDto extends PartialType(CreateTipoProdutoDto) {}
