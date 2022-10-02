import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PremiosOtorgadosHomeComponent } from './premios-otorgados-home/premios-otorgados-home.component';

const routes: Routes = [
  {path: '', component: PremiosOtorgadosHomeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PremiosInvestigadorPrRoutingModule { }