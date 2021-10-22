import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Configuracion} from '../llaves/configuracion';
import {CambioClave, Credenciales, CredencialesRecuperarClave, NotificacionCorreo, Usuario} from '../models';
import {NotificacionSms} from '../models/notificacion-sms.model';
import {UsuarioRepository} from '../repositories';
import {AdministradorClavesService, NotificacionesService} from '../services';
import {JwtService} from '../services/jwt.service';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(AdministradorClavesService)
    public servicioClaves: AdministradorClavesService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService,
    @service(JwtService)
    public servicioJWT: JwtService
  ) { }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    let clave = this.servicioClaves.CrearClaveAleatoria();
    console.log(clave);
    let claveCifrada = this.servicioClaves.CifrarTexto(clave);
    usuario.clave = claveCifrada
    let usuarioCreado = await this.usuarioRepository.create(usuario);
    if (usuarioCreado) {
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.correo;
      datos.asunto = Configuracion.asuntoCreacionUsuario;
      datos.saludo = `${Configuracion.saludo} ${usuario.nombres}`
      datos.mensaje = `${Configuracion.mensajeCreacionUsuario} ${clave}`
      this.servicioNotificaciones.EnviarCorreo(datos)
    }
    return usuarioCreado;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /** Metodos adicionales */
  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificacion de usuarios',
    content: {
      'application/json': {
        schema: {
          title: 'JsonWebToken response',
          type: 'object',
          properties: {
            token: {type: 'string'}
          }
        }
      }
    },
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales, {
            title: 'Identificar Usuario'
          }),
        },
      },
    })
    credenciales: Credenciales,
  ): Promise<object> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.usuario,
        clave: credenciales.clave
      }
    });

    if (usuario) return {
      token: this.servicioJWT.CrearTokenJWT(usuario)
    };

    throw new HttpErrors[401]("Usuario o clave incorrecta");
  }

  @authenticate('basic')
  @post('/cambiar-clave')
  @response(200, {
    description: 'Cambio de clave de usuarios',
    content: {'application/json': {schema: getModelSchemaRef(CambioClave)}},
  })
  async cambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object'
          },
        },
      },
    })
    credencialesClave: CambioClave,
  ): Promise<Boolean | null> {
    let usuario = await this.servicioClaves.CambiarClave(credencialesClave);
    if (usuario) {
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.correo;
      datos.asunto = Configuracion.asuntoCambioClave;
      datos.mensaje = `${Configuracion.saludo} ${usuario.nombres} <br />${Configuracion.mensajeCambioClave}`
      this.servicioNotificaciones.EnviarCorreo(datos)
    }
    return usuario != null;
  }

  @post('/recuperar-clave')
  @response(200, {
    description: 'Recuperar clave de usuarios',
    content: {'application/json': {schema: {}}},
  })
  async recuperarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: {},
        },
      },
    })
    credenciales: CredencialesRecuperarClave,
  ): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo
      }
    })
    if (usuario) {
      let clave = this.servicioClaves.CrearClaveAleatoria()
      console.log(clave);
      let claveCifrada = this.servicioClaves.CifrarTexto(clave)
      usuario.clave = this.servicioClaves.CifrarTexto(clave)
      await this.usuarioRepository.updateById(usuario._id, usuario)
      let datos = new NotificacionSms();
      datos.destino = usuario.celular;
      datos.mensaje = `${Configuracion.saludo} ${usuario.nombres} ${Configuracion.mensajeRecuperarClave} ${clave}`
      this.servicioNotificaciones.EnviarSms(datos)
    }
    return usuario;
  }
}
