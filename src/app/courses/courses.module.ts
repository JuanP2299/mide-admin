import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";
import { NgPipesModule } from "angular-pipes";
import { LoadingModule } from "ngx-loading";
import { NgxPaginationModule } from "ngx-pagination";
import { CoursesRoutingModule } from "./courses-routing.module";
import { ListCoursesComponent } from "./list-courses/list-courses.component";
import { CoursesComponent } from "./courses.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoursesRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    NgPipesModule,
    LoadingModule,
    NgxPaginationModule,
  ],
  declarations: [ListCoursesComponent, CoursesComponent],
})
export class CoursesModule {}
