import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PremiosInvestigadoresPrHomeComponent } from './premios-investigadores-pr-home/premios-investigadores-pr-home.component';

const routes: Routes = [
  {path: '', component: PremiosInvestigadoresPrHomeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PremiosInvestigadorPrRoutingModule { }