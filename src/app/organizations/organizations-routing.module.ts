import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ListOrganizationsComponent } from "./list-organizations/list-organizations.component";
import { ListSetsComponent } from "../sets/list-sets/list-sets.component";
import { ListCoursesComponent } from "../courses/list-courses/list-courses.component";

const routes: Routes = [
  { path: "organizations", component: ListOrganizationsComponent },
  {
    path: "organizations/:idOrganization",
    component: ListCoursesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
