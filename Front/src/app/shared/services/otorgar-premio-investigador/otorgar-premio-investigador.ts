import {Injectable, OnInit} from '@angular/core';
import {ApiService} from '../../../@core/services';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtorgarPremioInvestigadorService {

  private readonly endpoint = 'otorgar-premio-investigador';

  constructor(
      private http: ApiService,
  ) { }

  public getPremiados(): Observable<any> {
    return this.http.get(`${this.endpoint}`, null, true);
  }

  public getPremiadoById(userId: string): Observable<any> {
    return this.http.get(`${this.endpoint}/${userId}`, null, true)
        .pipe(map((res: any) => res || null));
  }

  public premiar(investigador, premio: string, merito: string): Observable<any> {
    return this.http.post(`${this.endpoint}`, {investigador, premio, merito}, null, true);
  }

  public eliminarPremiado(userId): Observable<any> {
    return this.http.delete(`${this.endpoint}/${userId}`)
        .pipe(map((res: any) => res || null));
  }
}
