import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ResetPasswordComponent} from './reset-password/reset-password.component';

const routes: Routes = [
  {path: 'resetpassword', component: ResetPasswordComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
