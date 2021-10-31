import {Model, model, property} from '@loopback/repository';

@model()
export class PerfilUsuario extends Model {
  @property({
    type: 'string',
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  roles: string[];

  @property({
    type: 'boolean',
    required: true
  })
  estado: boolean;

  @property({
    type: 'boolean'
  })
  temporal?: boolean;

  constructor(data?: Partial<PerfilUsuario>) {
    super(data);
  }
}

export interface PerfilUsuarioRelations {
  // describe navigational properties here
}

export type PerfilUsuarioWithRelations = PerfilUsuario & PerfilUsuarioRelations;
