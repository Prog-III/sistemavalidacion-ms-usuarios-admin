/**
 * Clase controlador para poder hacer operaciones de los tokens en servicios externos
 */

import {service} from '@loopback/core';
import {get, getModelSchemaRef, HttpErrors, requestBody, response} from '@loopback/rest';
import {Token} from '../models/token.model';
import {JwtService} from '../services/jwt.service';


export class TokenController {
  constructor(
    @service(JwtService)
    private servicioJWT: JwtService
  ) { }

  @get('/verificar-token')
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
}
