import {AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {JwtService} from '../services/jwt.service';
export class TemporalStrategy implements AuthenticationStrategy {
  name: string = 'temporal';

  constructor(
    @service(JwtService)
    private servicioJWT: JwtService
  ) {

  }

  async authenticate(request: Request): Promise<UserProfile> {
    const token = parseBearerToken(request);
    if (!token) throw new HttpErrors[401]("No existe un token en la solicitud");

    const infoToken = this.servicioJWT.VerificarTokenJWT(token);
    if (!infoToken) throw new HttpErrors[401]("El token es inválido");

    return Object.assign(infoToken);
  }
}
