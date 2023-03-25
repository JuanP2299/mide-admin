import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ListSetsComponent } from "../sets/list-sets/list-sets.component";
import { ListOrganizationsComponent } from "../organizations/list-organizations/list-organizations.component";

const routes: Routes = [
  { path: "organizations", component: ListOrganizationsComponent },

  {
    path: "organizations/:idOrganization/:idCourse",
    component: ListSetsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoursesRoutingModule {}
