import {Injectable, OnInit} from '@angular/core';
import {ApiService} from '../../../@core/services';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class bienesService {

  private readonly endpoint = 'bienes-servicios';

  constructor(
      private http: ApiService,
  ) { }

  public getAll(): Observable<any> {
    return this.http.get(`${this.endpoint}`, null, true);
  }

  public getById(id: string): Observable<any> {
    return this.http.get(`${this.endpoint}/${id}`, null, true)
        .pipe(map((res: any) => res || null));
  }
  public create(adm_recursos: String, codigo: String, convenio: String, fecha_solicitud: String, fecharequerida_actainicio: String, info_adicional: String, info_prov_ciudad: String, info_prov_correo: String, info_prov_direccion: String, info_prov_nombre: String, info_prov_numero: String, lugar_entrega: String, nombre_proyecto: String, objeto_contrato: String, observaciones_rubros: String, tiempo_ejecucion: String, tipo_requerimiento: String, tipo_rubro: String, valor_compromiso: String, valor_disponible: String,valor_estimado: String, valor_financiado: String, version: String, vigencia: String, proyecto): Observable<any> {
    return this.http.post(`${this.endpoint}`, {adm_recursos, codigo, convenio, fecha_solicitud, fecharequerida_actainicio, info_adicional, info_prov_ciudad, info_prov_correo, info_prov_direccion, info_prov_nombre, info_prov_numero, lugar_entrega, nombre_proyecto, objeto_contrato, observaciones_rubros, tiempo_ejecucion, tipo_requerimiento, tipo_rubro, valor_compromiso, valor_disponible, valor_estimado, valor_financiado, version, vigencia, proyecto}, null, true);
  }

  public delete(id): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`)
        .pipe(map((res: any) => res || null));
  }
}
