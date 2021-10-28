import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ConfiguracionJWT} from '../llaves/jsonwebtoken';
import {Token} from '../models/token.model';
import {Usuario} from '../models/usuario.model';
import {UsuarioRepository} from '../repositories/usuario.repository';

const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class JwtService {
  constructor(
    @repository(UsuarioRepository)
    private usuarioRepository: UsuarioRepository
  ) { }

  /*
   * Método que crea Json Web Token
   */
  async CrearTokenJWT(usuario: Usuario): Promise<string> {
    const {_id, correo, estado} = usuario;
    const rolesUsuario = await this.usuarioRepository.tiene_roles(_id).find();

    return jwt.sign({
      exp: ConfiguracionJWT.tiempoExpiracionJWT,
      data: {
        id: _id,
        correo,
        roles: rolesUsuario.map(rol => rol.nombre),
        estado
      }
    }, ConfiguracionJWT.llaveSecretaJWT)
  }

  /**
   * Método para desencriptar y verificar que
   * un token este valido
   */
  VerificarTokenJWT(token: string): Token {
    const tokenDecodificado = jwt.verify(token, ConfiguracionJWT.llaveSecretaJWT);

    return tokenDecodificado;
  }
}
