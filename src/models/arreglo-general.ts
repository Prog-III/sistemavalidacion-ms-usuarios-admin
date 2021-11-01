import {Model, model, property} from '@loopback/repository';

@model()
export class ArregloGeneral extends Model {
  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  arraygeneral: string[];


  constructor(data?: Partial<ArregloGeneral>) {
    super(data);
  }
}

export interface ArregloGeneralRelations {
  // describe navigational properties here
}

export type ArregloLineasInvestigacionWithRelations = ArregloGeneral & ArregloGeneralRelations;
