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

    return Object.assign(infoUsuario);
  }
}
