import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgPipesModule } from "angular-pipes";
import { LoadingModule } from "ngx-loading";
import { NgxPaginationModule } from "ngx-pagination";
import { MaterialModule } from "../material.module";

@NgModule({
  imports: [CommonModule, FormsModule, MaterialModule, NgPipesModule, LoadingModule, NgxPaginationModule],
  declarations: [],
})
export class PermisosModule {}
