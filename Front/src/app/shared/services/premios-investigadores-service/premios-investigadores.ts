import {Injectable, OnInit} from '@angular/core';
import {ApiService} from '../../../@core/services';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PremiosInvestigadoresService {

  private readonly endpoint = 'premios-investigador';

  constructor(
      private http: ApiService,
  ) { }

  public getPostulados(): Observable<any> {
    return this.http.get(`${this.endpoint}`, null, true);
  }

  public getPostuladoId(userId: string): Observable<any> {
    return this.http.get(`${this.endpoint}/${userId}`, null, true)
        .pipe(map((res: any) => res || null));
  }

  public postular(user): Observable<any> {
    return this.http.post(`${this.endpoint}`, user, null, true);
  }

  public eliminarPostulado(id: string) {//El bearer token, authorization header es el null, true
    return this.http.delete(`${this.endpoint}`, {body: {id}}, true); //metodo para eliminar que me ha funcionado
  }
}
