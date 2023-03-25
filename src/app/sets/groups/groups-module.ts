import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GroupsRoutingModule} from './groups.routing.module';
import {MaterialModule} from '../../material.module';
import {FormsModule} from '@angular/forms';
import {NgPipesModule} from 'angular-pipes';
import {LoadingModule} from 'ngx-loading';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    NgPipesModule,
    GroupsRoutingModule,
    LoadingModule,
    NgxPaginationModule
  ],
  declarations: [
  ]
})
export class GroupsModule {
}
