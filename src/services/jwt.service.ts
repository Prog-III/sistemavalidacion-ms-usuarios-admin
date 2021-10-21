import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {ConfiguracionJWT} from '../llaves/jsonwebtoken';
import {Usuario} from '../models/usuario.model';

const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class JwtService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Método que crea Json Web Token
   */
  CrearTokenJWT(usuario: Usuario): string {
    const {_id, documento, correo} = usuario;

    return jwt.sign({
      exp: ConfiguracionJWT.tiempoExpiracionJWT,
      data: {
        id: _id,
        documento,
        correo
      }
    }, ConfiguracionJWT.llaveSecretaJWT)
  }
}
