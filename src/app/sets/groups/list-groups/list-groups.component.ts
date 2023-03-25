import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import "rxjs/add/operator/first";
import { Set } from "../../../shared/models/set";
import { Group } from "../../../shared/models/group";
import { GroupService } from "../../../shared/services/group/group.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { DialogServiceService } from "../../../shared/services/dialog-service/dialog-service.service";
import { DialogDeleteService } from "../../../shared/services/dialog-service/dialog-delete-service.service.service";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { UserCognito } from "../../../shared/models/cognito-user";
import { SetService } from "../../../shared/services/set/set.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-codes",
  templateUrl: "./list-groups.component.html",
  styleUrls: ["./list-groups.component.scss"],
})
export class ListGroupsComponent implements OnInit {
  set: Set;
  groups: Array<Group>;
  newGroupForm: FormGroup;
  newGroupFormGroup: FormGroup;
  idCategory: string;
  activeInput: boolean;
  activeInputGroupsUser: boolean;
  active: true;
  loadComplete: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private loadingService: ProgressBarService,
    private dialogsService: DialogServiceService,
    private dialogDeleteService: DialogDeleteService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private setService: SetService
  ) {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.loadComplete = false;
      this.groups = [];
      this.activeInput = false;
      this.activeInputGroupsUser = false;
      this.newGroupForm = this.formBuilder.group({
        name: ["", Validators.required],
      });
      this.newGroupFormGroup = this.formBuilder.group({
        nameGroup: ["", Validators.required],
      });
      this.route.parent.parent.params.subscribe((setParams) => {
        this.idCategory = setParams.idSet;
        const sets: Array<Set> = JSON.parse(localStorage.getItem("sets"));
        if (sets && sets.length > 0) {
          for (const set of sets) {
            if (set.idCategory === setParams.idSet) {
              this.set = set;
              this.breadcrumbService.setBreadCrumb([
                { name: "Home", url: "/sets" },
                {
                  name: "Conjunto -" + this.set.name,
                  url: "/sets/" + this.set.idCategory,
                },
                {
                  name: "Administrar Usuarios",
                  url: "/sets/" + this.set.idCategory + "/groups",
                },
              ]);
              this.breadcrumbService.setBreadCrumbNow([
                { name: "Administrar Usuarios" },
              ]);
              this.getGroups();
              break;
            }
          }
        }
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  getGroups() {
    const idOrganization = this.setService.getIdOrganization();
    this.groupService
      .get(this.set.idCategory, idOrganization)
      .subscribe((data) => {
        const auxGroup = [];
        if (data && data.values && data.values.length > 0) {
          for (const group of data.values) {
            auxGroup.push(Group.parse(group));
          }
          localStorage.setItem(
            "groups-" + this.set.idCategory,
            JSON.stringify(auxGroup)
          );
          this.groups = auxGroup;
        }

        this.loadComplete = true;
      });
  }

  setNewGroup() {
    const group = {
      idCategory: this.idCategory,
      name: this.newGroupForm.get("name").value,
      save: true,
    };
    this.loadComplete = false;
    this.groupService.newGroup(group).subscribe((resp) => {
      group.save = undefined;
      if (resp.values.length > 0) {
        this.snackBar.open(resp.values[0].msg, "Cerrar", {
          duration: 3000,
        });
      } else {
        this.snackBar.open(
          "Error al crear grupo, intente nuevamente",
          "Cerrar",
          {
            duration: 3000,
          }
        );
      }
      this.getGroups();

      this.activeInput = false;
      this.newGroupForm.reset();
    });
  }

  activeNewGroup(active: boolean) {
    this.activeInput = active;
  }

  activeNewGroupUsers(active: boolean) {
    this.activeInputGroupsUser = active;
  }

  openDialog(group: any): void {
    this.activeInput = false;
    this.newGroupForm.reset();
    this.dialogsService
      .confirm("Confirm Dialog", group.name, group, this.idCategory)
      .subscribe((res) => {
        if (res) {
          this.loadGroups(res);
        }
      });
  }

  openDialogDelete(group: any): void {
    this.activeInput = false;
    this.newGroupForm.reset();
    this.dialogDeleteService
      .confirm("Confirm Dialog Delete", "delete", group, this.set.idCategory)
      .subscribe((res) => {
        if (res) {
          this.loadGroups(res);
        }
      });
  }

  openModalAsociarGrupo() {
    this.openAsociarGrupoDialog();
  }

  openAsociarGrupoDialog() {
    this.dialogsService.asociarGrupo("Confirm Dialog", this.idCategory, this.groups).subscribe(async (res) => {
      if (res) {
        if (res.msg) {
          this.snackBar.open(res.msg, "Cerrar", {
            duration: 3000,
          });
        }
        this.getGroups();
      }
    });
  }

  loadGroups(res: any) {
    this.newGroupForm.reset();
    this.groups = res;
  }

  ngOnInit() {}
}
