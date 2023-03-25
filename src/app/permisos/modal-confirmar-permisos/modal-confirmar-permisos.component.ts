import { first } from "rxjs/operators";
import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../../shared/services/user/user.service";
import { AuthService } from "../../shared/services/auth/auth.service";

@Component({
  selector: "app-modal-confirmar-permisos",
  templateUrl: "./modal-confirmar-permisos.component.html",
  styleUrls: ["./modal-confirmar-permisos.component.scss"],
})
export class ModalConfirmarPermisosComponent {
  title: any;
  idUser: any;
  action: string;
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalConfirmarPermisosComponent>,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  updatePermisos() {
    this.loading = true;
    this.userService.changeAdmin(this.idUser, this.action).subscribe(
      (resp) => {
        this.loading = false;
        this.closeDialog(true);
      },
      () => {
        this.loading = false;
        this.snackBar.open(
          "Error: al editar los permisos del admin, intente  nuevamente",
          "Cerrar",
          {
            duration: 3000,
          }
        );
        this.closeDialog(true);
      }
    );
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload });
  }
}
