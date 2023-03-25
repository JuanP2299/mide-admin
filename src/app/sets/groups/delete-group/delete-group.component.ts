import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Set } from "../../../shared/models/set";
import { Group } from "../../../shared/models/group";
import { GroupService } from "../../../shared/services/group/group.service";
import { SetService } from "../../../shared/services/set/set.service";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { AuthService } from "../../../shared/services/auth/auth.service";

@Component({
  selector: "app-edit-group",
  templateUrl: "./delete-group.component.html",
  styleUrls: ["./delete-group.component.scss"],
})
export class DeleteGroupComponent implements OnInit {
  idCategory: string;
  set: Set;
  group: any;
  groups: Array<Group>;
  title: string;
  message: string;
  active: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteGroupComponent>,
    private groupsService: GroupService,
    private loadingService: ProgressBarService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private setService: SetService
  ) {
    this.active = true;
  }

  deleteGroup(group: any) {
    this.active = false;

    this.groupsService.newGroup(group).subscribe((resp) => {
      if (resp && resp.msg) {
        this.snackBar.open(
          "El grupo se ha eliminado correctamente.",
          "Cerrar",
          {
            duration: 3000,
          }
        );
      }
      this.getGroups(this.idCategory);
    });
  }

  closeDialog(groups?: any) {
    this.dialogRef.close(groups);
  }

  getGroups(idCategory: string) {
    const idOrganization = this.setService.getIdOrganization();
    this.groupsService
      .get(this.idCategory, idOrganization)
      .subscribe((data) => {
        if (data && data.values && data.values.length > 0) {
          const auxGroup = [];
          for (const group of data.values) {
            auxGroup.push(Group.parse(group));
          }
          this.groups = auxGroup;
        } else {
          this.groups = [];
        }
        localStorage.setItem(
          "groups-" + idCategory,
          JSON.stringify(this.groups)
        );
        this.closeDialog(this.groups);
      });
  }

  ngOnInit() {}
}
