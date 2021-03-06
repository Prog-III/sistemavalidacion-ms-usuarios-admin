import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {Configuracion} from '../llaves/configuracion';
import {NotificacionCorreo} from '../models';
import {NotificacionSms} from '../models/notificacion-sms.model';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */

  EnviarCorreo(datos: NotificacionCorreo) {
    let url = `${Configuracion.urlCorreo}?${Configuracion.destinoArg}=${datos.destinatario}&${Configuracion.asuntoArg}=${datos.asunto}&${Configuracion.saludoArg}=${datos.saludo}&${Configuracion.mensajeArg}=${datos.mensaje}&${Configuracion.hashArg}=${Configuracion.hasNotificacion}`;
    fetch(url)
      .then((res: any) => {
        console.log(res.text())
      })
  }

  EnviarSms(datos: NotificacionSms) {
    let url = `${Configuracion.urlMensajeTexto}?${Configuracion.destinoArg}=${datos.destino}&${Configuracion.mensajeArg}=${datos.mensaje}&${Configuracion.hashArg}=${Configuracion.hasNotificacion}`;
    fetch(url)
      .then((res: any) => {
        console.log(res.text())
      })
  }
}
