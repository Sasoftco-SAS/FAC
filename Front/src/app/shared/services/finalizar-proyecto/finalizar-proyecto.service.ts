import { Injectable } from '@angular/core';
import {ApiService} from '../../../@core/services';

@Injectable({
  providedIn: 'root'
})
export class FinalizarPrService {

  private readonly endpoint = 'finalizar-pr';

  constructor(
      private http: ApiService,
  ) { }

  createFinalizarPr(proyecto, estado: number) {
    return this.http.post(`${this.endpoint}`, {proyecto, estado}, null, true);
  }

  getAll() {
    return this.http.get(`${this.endpoint}`, null, true);
  }

  updateFinalizarPr(id: string, proyecto, estado: number){
    return this.http.patch(`${this.endpoint}/${id}`, {proyecto, estado}, null, true);
  }

  getById(id: string){
    return this.http.get(`${this.endpoint}/${id}`, null, true);
  }

  removeFinalizarPr(id: string) {
    return this.http.delete(`${this.endpoint}`, {body: {id}}, true);
  }

}

