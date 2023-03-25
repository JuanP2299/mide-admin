import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [ResetPasswordComponent]
})
export class AuthModule { }
