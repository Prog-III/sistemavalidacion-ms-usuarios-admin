import {Model, model, property} from '@loopback/repository';
import {PerfilUsuario} from './perfil-usuario.model';

@model()
export class Token extends Model {
  @property({
    type: 'number',
    required: true,
  })
  exp: number;

  @property({
    type: PerfilUsuario,
    required: true,
  })
  data: PerfilUsuario;


  constructor(data?: Partial<Token>) {
    super(data);
  }
}

export interface TokenRelations {
  // describe navigational properties here
}

export type TokenWithRelations = Token & TokenRelations;
