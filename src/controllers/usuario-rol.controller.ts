import {authenticate} from '@loopback/authentication';
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
  Rol, Usuario, UsuarioRol
} from '../models';
import {ArregloGeneral} from '../models/arreglo-general';
import {UsuarioRepository, UsuarioRolRepository} from '../repositories';

@authenticate('admin')
export class UsuarioRolController {
  constructor(
    @repository(UsuarioRepository) protected usuarioRepository: UsuarioRepository,
    @repository(UsuarioRolRepository) protected usuarioRolRepository: UsuarioRolRepository
  ) { }

  @get('/usuarios/{id}/roles', {
    responses: {
      '200': {
        description: 'Array of Usuario has many Rol through UsuarioRol',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rol)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Rol>,
  ): Promise<Rol[]> {
    return this.usuarioRepository.tiene_roles(id).find(filter);
  }

  @post('/usuario-rol', {
    responses: {
      '200': {
        description: 'create a instance of rol with a usuario',
        content: {'application/json': {schema: getModelSchemaRef(UsuarioRol)}},
      },
    },
  })
  async createRelation(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsuarioRol, {
            title: 'NewRolWithUsuario',
            exclude: ['_id'],
          }),
        },
      },
    }) datos: Omit<UsuarioRol, 'id'>,
  ): Promise<UsuarioRol | null> {
    let registro = await this.usuarioRolRepository.create(datos);
    return registro;
  }

  @authenticate('admin', 'temporal')
  @post('/asociar-usuario-roles/{id}', {
    responses: {
      '200': {
        description: 'create a instance of roles with a usuario',
        content: {'application/json': {schema: getModelSchemaRef(UsuarioRol)}},
      },
    },
  })
  async createRelations(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArregloGeneral),
        },
      },
    }) datos: ArregloGeneral,
    @param.path.string('id') id_usuario: typeof Usuario.prototype._id
  ): Promise<Boolean> {
    if (datos.arraygeneral.length > 0) {
      datos.arraygeneral.forEach(async (id_rol: string) => {
        let existe = await this.usuarioRolRepository.findOne({
          where: {
            id_usuario: id_usuario,
            id_rol: id_rol
          }
        });

        if (!existe) {
          this.usuarioRolRepository.create({
            id_usuario: id_usuario,
            id_rol: id_rol
          });
        }
      });
      return true;
    }
    return false;
  }


  @del('/usuarios/{id_usuario}/{id_rol}')
  @response(204, {
    description: 'relation DELETE success',
  })
  async EliminarRoldeUsuario(
    @param.path.string('id_usuario') id_usuario: string,
    @param.path.string('id_rol') id_rol: string): Promise<Boolean> {
    let reg = await this.usuarioRolRepository.findOne({
      where: {
        id_usuario: id_usuario,
        id_rol: id_rol
      }
    });
    if (reg) {
      await this.usuarioRolRepository.deleteById(reg._id);
      return true;
    }
    return false;
  }

}
/* ------------------- */
