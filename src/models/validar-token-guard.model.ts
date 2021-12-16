import {Model, model, property} from '@loopback/repository';

@model()
export class ValidarTokenGuard extends Model {
  @property({
    type: 'string',
  })
  token?: string;

  @property({
    type: 'string',
  })
  correo?: string;


  constructor(data?: Partial<ValidarTokenGuard>) {
    super(data);
  }
}

export interface ValidarTokenGuardRelations {
  // describe navigational properties here
}

export type ValidarTokenGuardWithRelations = ValidarTokenGuard & ValidarTokenGuardRelations;
