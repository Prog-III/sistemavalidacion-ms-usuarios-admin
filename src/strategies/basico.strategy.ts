import {AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {JwtService} from '../services/jwt.service';

export class BasicoStrategy implements AuthenticationStrategy {
  name: string = 'basic';

  constructor(
    @service(JwtService)
    public servicioJWT: JwtService
  ) { }

  async authenticate(request: Request): Promise<UserProfile> {
    const token = parseBearerToken(request);
    if (!token) throw new HttpErrors[401]("No existe un token en la solicitud");

    const infoUsuario = this.servicioJWT.VerificarTokenJWT(token);
    if (!infoUsuario) throw new HttpErrors[401]("El token es invalido");

    const {estado, roles} = infoUsuario.data;
    if (!estado) throw new HttpErrors[401]("El usuario no está habilitado en el sistema");
    if (!roles || roles.length === 0) throw new HttpErrors[401]("El usuario no tiene los permisos necesarios para realizar la operacion");

    return Object.assign(infoUsuario);
  }
}
