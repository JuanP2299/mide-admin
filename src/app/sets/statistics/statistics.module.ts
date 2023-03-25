import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { FormsModule } from "@angular/forms";
import { NgPipesModule } from "angular-pipes";
import { LoadingModule } from "ngx-loading";
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  imports: [CommonModule, FormsModule, MaterialModule, NgPipesModule, LoadingModule, NgxPaginationModule],
  declarations: [],
})
export class StatisticsModule {}
