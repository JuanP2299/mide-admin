import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { ChangeService } from "../../../shared/services/change/change.service";
import { SetService } from "../../../shared/services/set/set.service";
import { Change } from "../../../shared/models/change";

@Component({
  selector: "app-delete-modal",
  templateUrl: "./delete-modal.component.html",
  styleUrls: ["./delete-modal.component.scss"],
})
export class DeleteModalComponent implements OnInit {
  title: string;
  message: string;
  type: string;
  active: boolean;
  idSet: string;
  change: Change;
  exist: boolean;
  typeChange: string;
  activeUpdateCat: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private setService: SetService,
    private changeService: ChangeService
  ) {
    this.active = true;
  }

  deleteChange() {
    const type = /^category(\w|\W)*$/.test(this.type)
      ? "Categoria"
      : "Pregunta";
    this.active = false;

    this.changeService
      .delete(this.setService.getIdOrganization(), this.idSet, this.type)
      .subscribe((res) => {
        if (res && res.msg) {
          this.snackBar.open(type + " eliminada correctamente", "Cerrar", {
            duration: 3000,
          });

          this.closeDialog(true);
        } else {
          this.snackBar.open(res.err, "Cerrar", {
            duration: 3000,
          });
          this.closeDialog(false);
        }
      });
  }

  saveChange() {
    this.change.action = "delete";
    this.createdAction();
  }

  createdAction() {
    this.active = false;
    this.changeService.post(this.change).subscribe((res) => {
      if (res && res.values[0].status === "200") {
        this.snackBar.open(
          this.typeChange.charAt(0).toUpperCase() +
            this.typeChange.slice(1) +
            " eliminada correctamente!",
          "Cerrar",
          {
            duration: 3000,
          }
        );
        this.closeDialog(true);
      } else {
        this.snackBar.open(
          "Error al eliminar, intentente nuevamente",
          "Cerrar",
          {
            duration: 3000,
          }
        );
        this.closeDialog(true);
      }
    });
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload });
  }

  ngOnInit() {
    this.typeChange = /^question(\w|\W)*$/.test(this.type)
      ? "pregunta"
      : "categoria";
  }
}
