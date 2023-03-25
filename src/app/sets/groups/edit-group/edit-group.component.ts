import { first } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Component, OnInit } from "@angular/core";
import { Set } from "../../../shared/models/set";
import { Group } from "../../../shared/models/group";
import { GroupService } from "../../../shared/services/group/group.service";
import { SetService } from "../../../shared/services/set/set.service";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { AuthService } from "../../../shared/services/auth/auth.service";

@Component({
  selector: "app-edit-group",
  templateUrl: "./edit-group.component.html",
  styleUrls: ["./edit-group.component.scss"],
})
export class EditGroupComponent implements OnInit {
  editGroupForm: FormGroup;
  idCategory: string;
  set: Set;
  groups: Array<Group>;
  title: string;
  message: string;
  group: Group;
  active: boolean;
  lastName: string;

  constructor(
    public dialogRef: MatDialogRef<EditGroupComponent>,
    private formBuilder: FormBuilder,
    private groupsService: GroupService,
    private loadingService: ProgressBarService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private setService: SetService
  ) {
    this.active = true;
    this.editGroupForm = this.formBuilder.group({
      name: ["", Validators.required],
    });
    this.lastName = "";
  }

  updateGroup() {
    this.group.name = this.editGroupForm.get("name").value.toLowerCase();
    this.active = false;

    this.groupsService.updateGroup(this.group).subscribe(
      (resp) => {
        if (resp.values.length > 0) {
          this.snackBar.open(resp.values[0].msg, "Cerrar", {
            duration: 3000,
          });
          if (!resp.values[0].save) {
            this.group.name = this.lastName;
            this.closeDialog();
          } else {
            this.getGroups();
          }
        } else {
          this.snackBar.open("Error: al editar grupo, intente  nuevamente", "Cerrar", {
            duration: 3000,
          });
          this.closeDialog();
        }
      },
      () => {
        this.snackBar.open("Error: al editar grupo, intente  nuevamente", "Cerrar", {
          duration: 3000,
        });
        this.closeDialog();
      }
    );
  }

  closeDialog(groups?: any) {
    this.dialogRef.close(groups);
  }

  getGroups() {
    const idOrganization = this.setService.getIdOrganization();
    this.groupsService.get(this.idCategory, idOrganization).subscribe((data) => {
      if (data && data.values && data.values.length > 0) {
        const auxGroup = [];
        for (const group of data.values) {
          auxGroup.push(Group.parse(group));
        }
        this.groups = auxGroup;
        localStorage.setItem("groups-" + this.idCategory, JSON.stringify(this.groups));
        this.closeDialog(this.groups);
      }
    });
  }

  ngOnInit() {
    this.lastName = this.group.name;
  }
}
