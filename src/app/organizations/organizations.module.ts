import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";
import { NgPipesModule } from "angular-pipes";
import { LoadingModule } from "ngx-loading";
import { NgxPaginationModule } from "ngx-pagination";
import { OrganizationsRoutingModule } from "./organizations-routing.module";
import { ListOrganizationsComponent } from "./list-organizations/list-organizations.component";
import { OrganizationsComponent } from "./organizations.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OrganizationsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    NgPipesModule,
    LoadingModule,
    NgxPaginationModule,
  ],
  declarations: [ListOrganizationsComponent, OrganizationsComponent],
})
export class OrganizationsModule {}
