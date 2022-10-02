import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BienesServiciosHomeComponent } from './bienes-servicios-home/bienes-servicios-home.component';

const routes: Routes = [
  {path: '', component: BienesServiciosHomeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BienesServiciosRoutingModule { }