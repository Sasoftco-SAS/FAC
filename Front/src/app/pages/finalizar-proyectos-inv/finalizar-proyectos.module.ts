import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinProyectosHomeComponent } from './finalizar_proyectos-home/finalizar_proyectos-home.component';

const routes: Routes = [
  {path: '', component: FinProyectosHomeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinProyectosRoutingModule { }