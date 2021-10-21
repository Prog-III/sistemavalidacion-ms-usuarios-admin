import {
  Filter,
  repository
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef, param, post,
  requestBody,
  response
} from '@loopback/rest';
import {
  Permiso, PermisoRol, Rol
} from '../models';
import {ArregloGeneral} from '../models/arreglo-general';
import {PermisoRolRepository, RolRepository} from '../repositories';

export class RolPermisoController {
  constructor(
    @repository(RolRepository) protected rolRepository: RolRepository,
    @repository(PermisoRolRepository) protected permisoRolRepository: PermisoRolRepository
  ) { }

  @get('/roles/{id}/permisos', {
    responses: {
      '200': {
        description: 'Array of Roles has many Permiso through RolPermiso',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Permiso)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Permiso>,
  ): Promise<Permiso[]> {
    return this.rolRepository.tiene_permisos(id).find(filter);
  }

  @post('/rol-permiso', {
    responses: {
      '200': {
        description: 'create a instance of permiso with a rol',
        content: {'application/json': {schema: getModelSchemaRef(PermisoRol)}},
      },
    },
  })
  async createRelation(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PermisoRol, {
            title: 'NewPermisoWithRol',
            exclude: ['_id'],
          }),
        },
      },
    }) datos: Omit<PermisoRol, 'id'>,
  ): Promise<PermisoRol | null> {
    let registro = await this.permisoRolRepository.create(datos);
    return registro;
  }

  @post('/asociar-rol-permisos/{id}', {
    responses: {
      '200': {
        description: 'create a instance of permisos with a rol',
        content: {'application/json': {schema: getModelSchemaRef(PermisoRol)}},
      },
    },
  })
  async createRelations(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArregloGeneral, {}),
        },
      },
    }) datos: ArregloGeneral,
    @param.path.string('id') id_rol: typeof Rol.prototype._id
  ): Promise<Boolean> {
    if (datos.arraygeneral.length > 0) {
      datos.arraygeneral.forEach(async (id_permiso: string) => {
        let existe = await this.permisoRolRepository.findOne({
          where: {
            id_rol: id_rol,
            id_permiso: id_permiso
          }
        });
        if (!existe) {
          this.permisoRolRepository.create({
            id_rol: id_rol,
            id_permiso: id_permiso
          });
        }
      });
      return true;
    }
    return false;
  }


  @del('/roles/{id_rol}/{id_permiso}')
  @response(204, {
    description: 'relation DELETE success',
  })
  async EliminarPermisodeRol(
    @param.path.string('id_rol') id_rol: string,
    @param.path.string('id_permiso') id_permiso: string): Promise<Boolean> {
    let reg = await this.permisoRolRepository.findOne({
      where: {
        id_rol: id_rol,
        id_permiso: id_permiso
      }
    });
    if (reg) {
      await this.permisoRolRepository.deleteById(reg._id);
      return true;
    }
    return false;
  }

}
/* -------------------

@get('/rols/{id}/permisos', {
  responses: {
    '200': {
      description: 'Array of Rol has many Permiso through PermisoRol',
      content: {
        'application/json': {
          schema: {type: 'array', items: getModelSchemaRef(Permiso)},
        },
      },
    },
  },
})
async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter ?: Filter < Permiso >,
  ): Promise < Permiso[] > {
  return this.rolRepository.tiene_permisos(id).find(filter);
}

@post('/rols/{id}/permisos', {
  responses: {
    '200': {
      description: 'create a Permiso model instance',
      content: {'application/json': {schema: getModelSchemaRef(Permiso)}},
    },
  },
})
async create(
    @param.path.string('id') id: typeof Rol.prototype._id,
    @requestBody({
  content: {
    'application/json': {
      schema: getModelSchemaRef(Permiso, {
        title: 'NewPermisoInRol',
        exclude: ['_id'],
      }),
    },
  },
}) permiso: Omit < Permiso, '_id' >,
  ): Promise < Permiso > {
  return this.rolRepository.tiene_permisos(id).create(permiso);
}

@patch('/rols/{id}/permisos', {
  responses: {
    '200': {
      description: 'Rol.Permiso PATCH success count',
      content: {'application/json': {schema: CountSchema}},
    },
  },
})
async patch(
    @param.path.string('id') id: string,
    @requestBody({
  content: {
    'application/json': {
      schema: getModelSchemaRef(Permiso, {partial: true}),
    },
  },
})
permiso: Partial < Permiso >,
    @param.query.object('where', getWhereSchemaFor(Permiso)) where ?: Where < Permiso >,
  ): Promise < Count > {
  return this.rolRepository.tiene_permisos(id).patch(permiso, where);
}

@del('/rols/{id}/permisos', {
  responses: {
    '200': {
      description: 'Rol.Permiso DELETE success count',
      content: {'application/json': {schema: CountSchema}},
    },
  },
})
async delete (
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Permiso)) where ?: Where < Permiso >,
  ): Promise < Count > {
  return this.rolRepository.tiene_permisos(id).delete(where);
}
}*/
