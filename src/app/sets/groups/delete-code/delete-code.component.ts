import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Code } from "../../../shared/models/codes";
import { GroupService } from "../../../shared/services/group/group.service";
import { SetService } from "../../../shared/services/set/set.service";
@Component({
  selector: "app-delete-code",
  templateUrl: "./delete-code.component.html",
  styleUrls: ["./delete-code.component.scss"],
})
export class DeleteCodeComponent implements OnInit {
  idCategory: string;
  code: Code;
  codes: Array<Code>;
  title: string;
  message: string;
  active: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteCodeComponent>,
    private loadingService: ProgressBarService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private setService: SetService,
    private groupService: GroupService
  ) {
    this.active = true;
    this.codes = [];
  }

  closeDialog(codes?: Array<Code>) {
    this.dialogRef.close(codes);
  }

  deleteCode(code: Code) {
    this.active = false;
    code.deleteAction = true;
    code.idOrganization = this.setService.getIdOrganization();
    this.groupService.genCode(code).subscribe((data) => {
      if (data && data.values[0]) {
        this.snackBar.open("Cupón eliminado correctamente.", "Cerrar", {
          duration: 3000,
        });
        this.getCodes(code.idGroup);
      } else {
        this.snackBar.open(
          "Error al eliminar cupón . Intente nuevamente.",
          "Cerrar",
          {
            duration: 3000,
          }
        );
      }
    });
  }

  getCodes(idGroup: string) {
    const idOrganization = this.setService.getIdOrganization();
    this.groupService
      .get(this.idCategory, idOrganization, idGroup)
      .subscribe((data) => {
        if (data && data.values && data.values.length > 0) {
          const auxCodes = [];
          for (const code of data.values) {
            auxCodes.push(Code.parse(code));
          }
          this.codes = auxCodes;
        }
        this.closeDialog(this.codes);
      });
  }

  ngOnInit() {}
}
