/**
 * Clase controlador para poder hacer operaciones de los tokens en servicios externos
 */

import {service} from '@loopback/core';
import {getModelSchemaRef, HttpErrors, param, post, requestBody, response} from '@loopback/rest';
import {MD5} from 'crypto-js';
import {ConfiguracionJWT} from '../llaves/jsonwebtoken';
import {ValidarTokenGuard} from '../models';
import {Token} from '../models/token.model';
import {JwtService} from '../services/jwt.service';
const fetch= require('node-fetch');


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
    if (llaveSecretaToken !== MD5(ConfiguracionJWT.llaveSecretaJWT).toString()) {
      throw new HttpErrors[401]("El cliente no está autorizado para realizar esta petición");
    }

    return this.servicioJWT.CrearTokenTemporalJWT();
  }


  @post('/verificar-token-id/{id}', {
    responses: {
      '200':{description:'Validar email', }
    }
  })

  async verificarTokenEmail(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json':{schema: getModelSchemaRef(ValidarTokenGuard),}
        ,}
      })
      token: ValidarTokenGuard

  ): Promise<boolean> {
    if (token.token) {
      let info=  this.servicioJWT.VerificarTokenJWT(token.token);
      if(info){
        console.log(info.data.correo);

        //CONSULTAR USUARIO EN OTRO Microservici
        let respuesta: any;
        respuesta= await fetch(`http://localhost:3000/jurados-email/${id}`)
// ENVIAR TOKEN EN LA SOLICITUD
        let correo = await respuesta.text()+"";
        if(info.data.correo == correo.toString()) {
          return true;
        }else{
          return false;
        }
    }


    throw new HttpErrors[400]("No existe un token en la petición")
  }
  return false;
}
}
