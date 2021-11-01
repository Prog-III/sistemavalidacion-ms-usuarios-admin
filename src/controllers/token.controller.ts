/**
 * Clase controlador para poder hacer operaciones de los tokens en servicios externos
 */

import {service} from '@loopback/core';
import {getModelSchemaRef, HttpErrors, param, post, requestBody, response} from '@loopback/rest';
import {ConfiguracionJWT} from '../llaves/jsonwebtoken';
import {Token} from '../models/token.model';
import {JwtService} from '../services/jwt.service';


export class TokenController {
  constructor(
    @service(JwtService)
    private servicioJWT: JwtService
  ) { }

  @post('/verificar-token')
  @response(200, {
    description: 'Token decodificado',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Token, {
          title: 'Objeto de token decodificado'
        })
      }
    }
  })
  async verificarToken(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            title: 'Token codificado',
            type: 'string'
          }
        }
      }
    })
    token: string
  ): Promise<Token> {
    if (token) {
      return this.servicioJWT.VerificarTokenJWT(token);
    }

    throw new HttpErrors[400]("No existe un token en la petición")
  }

  @post('/token-temporal')
  @response(200, {
    description: 'Token decodificado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'}
          }
        }
      }
    }
  })
  async crearTokenTemporal(
    @param.header.string('x-jwt-secret-key') llaveSecretaToken: string
  ) {
    if (llaveSecretaToken !== ConfiguracionJWT.llaveSecretaJWT) {
      throw new HttpErrors[401]("El cliente no está autorizado para realizar esta petición");
    }

    return this.servicioJWT.CrearTokenTemporalJWT();
  }
}
