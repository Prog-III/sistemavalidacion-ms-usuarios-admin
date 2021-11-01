import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AES, enc, MD5} from 'crypto-js';
import {Configuracion} from '../llaves/configuracion';
import {CambioClave, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
const generator = require('generate-password');


@injectable({scope: BindingScope.TRANSIENT})
export class AdministradorClavesService {
  constructor(
    @repository(UsuarioRepository) public usuarioRepository: UsuarioRepository,
  ) { }

  /*
   * Add service methods here
   */
  async CambiarClave(credencialesClave: CambioClave): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        _id: credencialesClave.id_usuario,
        clave: credencialesClave.clave_actual
      }
    })
    if (usuario) {
      usuario.clave = this.CifrarTexto(credencialesClave.nueva_clave);
      await this.usuarioRepository.updateById(credencialesClave.id_usuario, usuario)
      return usuario
    } else {
      return null
    }
  }

  CrearClaveAleatoria(): string {
    let password = generator.generate({
      length: 8,
      numbers: true,
      uppercase: true
    });
    return password;
  }

  CifrarTexto(texto: string): string {
    return MD5(texto).toString();
  }

  DescifrarTexto(textoCifrado: string): string {
    return AES.decrypt(textoCifrado, Configuracion.claveEncriptacion).toString(enc.Utf8);
  }
}
