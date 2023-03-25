import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { SetService } from "../../../shared/services/set/set.service";

@Component({
  selector: "app-delete-set",
  templateUrl: "./delete-set.component.html",
  styleUrls: ["./delete-set.component.scss"],
})
export class DeleteSetComponent implements OnInit {
  title: string;
  idCategory: string;
  message: string;
  active: boolean;

  constructor(
    public dialogRef: MatDialogRef<DeleteSetComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private setService: SetService
  ) {
    this.active = true;
  }

  deleteSet() {
    this.active = false;

    const idOrganization = this.setService.getIdOrganization();
    this.setService
      .deleteSet(this.idCategory, idOrganization)
      .subscribe((res) => {
        if (res.msg) {
          this.snackBar.open(res.msg, "Cerrar", {
            duration: 3000,
          });
          const aux = [];
          const sets = JSON.parse(localStorage.getItem("sets"));
          sets.find((item) => {
            if (item.idCategory !== this.idCategory) {
              aux.push(item);
            }
          });
          localStorage.setItem("sets", JSON.stringify(aux));
          this.closeDialog(aux);
        } else {
          this.snackBar.open(res.err, "Cerrar", {
            duration: 3000,
          });
          this.closeDialog();
        }
      });
  }

  closeDialog(sets?: any) {
    this.active = true;
    this.dialogRef.close(sets);
  }

  ngOnInit() {}
}
