import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TeacherService } from "../../../shared/services/teacher/teacher.service";
import { AuthService } from "../../../shared/services/auth/auth.service";

@Component({
  selector: "app-modal-asociar-profesor",
  templateUrl: "./modal-asociar-profesor.component.html",
  styleUrls: ["./modal-asociar-profesor.component.scss"],
})
export class ModalAsociarProfesorComponent implements OnInit {
  title: string;
  idUser: any;

  action: string;
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalAsociarProfesorComponent>,
    private teacherService: TeacherService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  updatePerfilProfesor() {
    this.loading = true;
    this.teacherService.update(this.idUser, this.action).subscribe(
      (resp) => {
        this.loading = false;
        this.closeDialog(true);
      },
      () => {
        this.loading = false;
        this.snackBar.open("Error al editar el usuario", "Cerrar", {
          duration: 3000,
        });
        this.closeDialog(true);
      }
    );
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload });
  }

  ngOnInit() {}
}
