import { Injectable } from '@angular/core';
import {ApiService} from '../../../@core/services';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  private readonly endpoint = 'notificacion';

  constructor(
      private http: ApiService,
  ) { }

  createNotificacion(usuario, mensaje: string, detalle: string, tipo: string) {
    return this.http.post(`${this.endpoint}`, {usuario, mensaje, detalle, tipo}, null, true);
  }

  getAll() {
    return this.http.get(`${this.endpoint}`, null, true);
  }

  removeNotificacion(id: string) {
    return this.http.delete(`${this.endpoint}`, {body: {id}}, true);
  }

}

