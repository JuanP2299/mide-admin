import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgPipesModule } from "angular-pipes";
import { LoadingModule } from "ngx-loading";
import { NgxPaginationModule } from "ngx-pagination";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { SetsRoutingModule } from "./sets-routing.module";
import { ListSetsComponent } from "./list-sets/list-sets.component";
import { ViewSetsComponent } from "./view-sets/view-sets.component";
import { SetsComponent } from "./sets.component";
import { MaterialModule } from "../material.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { ListGroupsComponent } from "./groups/list-groups/list-groups.component";
import { GroupsComponent } from "./groups/groups.component";
import { EditGroupComponent } from "./groups/edit-group/edit-group.component";
import { ViewGroupComponent } from "./groups/view-group/view-group.component";
import { DeleteGroupComponent } from "./groups/delete-group/delete-group.component";
import { DeleteCodeComponent } from "./groups/delete-code/delete-code.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { GeoComponent } from "./statistics/geo/geo.component";
import { DetailsComponent } from "./statistics/details/details.component";
import { GeneralComponent } from "./statistics/general/general.component";
import { UserComponent } from "./statistics/user/user.component";
import { ModalStatisticsComponent } from "./statistics/general/modal-statistics/modal-statistics.component";
import { DeleteSetComponent } from "./list-sets/delete-set/delete-set.component";
import { DeleteModalComponent } from "./view-sets/delete-modal/delete-modal.component";
import { ModalAsociarUsuariosComponent } from "../modal-asociar-usuarios/modal-asociar-usuarios.component";
import { SetsFileUploadModalComponent } from "./view-sets/sets-file-upload-modal/sets-file-upload-modal.component";
import { ResumeComponent } from "./resume/resume.component";
import { ModalConfirmationComponent } from "./resume/modal-confirmation/modal-confirmation.component";
import { FilesComponent } from "../sets/files/files.component";
import { PermisosComponent } from "../permisos/permisos.component";

import { OpenQuestionsComponent } from "./statistics/open-questions/open-questions.component";
import { ModalConfirmarPermisosComponent } from "../permisos/modal-confirmar-permisos/modal-confirmar-permisos.component";
import { ModalAsociarPermisosEscuelaComponent } from "../permisos/modal-asociar-permisos-escuela/modal-asociar-permisos-escuela.component";
import { ModalAsociarProfesorComponent } from "../sets/groups/modal-asociar-profesor/modal-asociar-profesor.component";

import { ModalAsociarGrupoComponent } from "../modal-asociar-grupo/modal-asociar-grupo.component";
import { DefaultSetsComponent } from "../default-sets/default-sets.component";

///import { AngularEditorModule } from '@kolkov/angular-editor';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SetsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    StatisticsModule,
    NgPipesModule,
    LoadingModule,
    NgxPaginationModule,
    HttpClientModule,
    AngularEditorModule,
  ],
  declarations: [
    ListSetsComponent,
    ViewSetsComponent,
    SetsComponent,
    GroupsComponent,
    ListGroupsComponent,
    EditGroupComponent,
    ViewGroupComponent,
    DeleteGroupComponent,
    DeleteCodeComponent,
    StatisticsComponent,
    GeoComponent,
    DetailsComponent,
    GeneralComponent,
    UserComponent,
    ModalStatisticsComponent,
    DeleteSetComponent,
    DeleteModalComponent,
    SetsFileUploadModalComponent,
    ResumeComponent,
    ModalConfirmationComponent,
    ModalAsociarUsuariosComponent,
    ModalAsociarGrupoComponent,
    FilesComponent,
    PermisosComponent,
    DefaultSetsComponent,
    UserComponent,
    OpenQuestionsComponent,
    ModalConfirmarPermisosComponent,
    ModalAsociarPermisosEscuelaComponent,
    ModalAsociarPermisosEscuelaComponent,
    ModalAsociarProfesorComponent,
    ModalAsociarGrupoComponent,
  ],
  entryComponents: [
    ModalConfirmarPermisosComponent,
    ModalAsociarPermisosEscuelaComponent,
    ModalAsociarProfesorComponent,
    ModalAsociarGrupoComponent,
  ],
})
export class SetsModule {}
