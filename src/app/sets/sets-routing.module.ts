import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ListSetsComponent } from "./list-sets/list-sets.component";
import { ViewSetsComponent } from "./view-sets/view-sets.component";
import { SetsComponent } from "./sets.component";
import { ListGroupsComponent } from "./groups/list-groups/list-groups.component";
import { ViewGroupComponent } from "./groups/view-group/view-group.component";
import { GroupsComponent } from "./groups/groups.component";
import { EditGroupComponent } from "./groups/edit-group/edit-group.component";
import { DeleteGroupComponent } from "./groups/delete-group/delete-group.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { DeleteCodeComponent } from "./groups/delete-code/delete-code.component";
import { DeleteSetComponent } from "./list-sets/delete-set/delete-set.component";
import { DeleteModalComponent } from "./view-sets/delete-modal/delete-modal.component";
import { ModalAsociarUsuariosComponent } from "../modal-asociar-usuarios/modal-asociar-usuarios.component";
import { SetsFileUploadModalComponent } from "./view-sets/sets-file-upload-modal/sets-file-upload-modal.component";
import { ResumeComponent } from "./resume/resume.component";
import { ModalConfirmationComponent } from "./resume/modal-confirmation/modal-confirmation.component";
import { FilesComponent } from "./files/files.component";
import { ListCoursesComponent } from "../courses/list-courses/list-courses.component";
import { UserComponent } from "./statistics/user/user.component";
import { OpenQuestionsComponent } from "./statistics/open-questions/open-questions.component";

OpenQuestionsComponent;
const routes: Routes = [
  { path: "organizations/:idOrganization", component: ListCoursesComponent },
  { path: "sets", component: ListSetsComponent },
  {
    path: "sets/:idSet",
    component: SetsComponent,
    children: [
      { path: "", component: ViewSetsComponent },
      { path: "publish", component: ResumeComponent },
      { path: "publish-confirmation", component: ModalConfirmationComponent },
      { path: "delete-set", component: DeleteSetComponent },
      { path: "delete-change", component: DeleteModalComponent },
      { path: "users-asociate", component: ModalAsociarUsuariosComponent },
      { path: "file-upload-change", component: SetsFileUploadModalComponent },
      { path: "file-upload-set", component: FilesComponent },
      {
        path: "statistics",
        component: StatisticsComponent,
        children: [
          // { path: "geo", component: GeoComponent },
          // { path: "details", component: DetailsComponent },
          // {
          //   path: "general/modal-statistic",
          //   component: ModalStatisticsComponent,
          // },
        ],
      },
      {
        path: "statistics/user/:idUser",
        component: UserComponent,
      },
      {
        path: "statistics/open-questions/:idSet/:idUser/:userName/:userEmail",
        component: OpenQuestionsComponent,
      },
      {
        path: "groups-actions",
        component: GroupsComponent,
        children: [
          { path: "", component: ListGroupsComponent },
          { path: "edit/:idGroup", component: EditGroupComponent },
          { path: "view/:idGroup", component: ViewGroupComponent },
          { path: "delete-group/:idGroup", component: DeleteGroupComponent },
          { path: "delete-code/:idCode", component: DeleteCodeComponent },
        ],
      },
      {
        path: "upload-set-file",
        component: GroupsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetsRoutingModule {}
