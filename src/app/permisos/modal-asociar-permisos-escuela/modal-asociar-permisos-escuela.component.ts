import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { UserService } from "../../shared/services/user/user.service";
import { AuthService } from "../../shared/services/auth/auth.service";
import { OrganizationService } from "../../shared/services/organization/organization.service";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "app-modal-asociar-permisos-escuela",
  templateUrl: "./modal-asociar-permisos-escuela.component.html",
  styleUrls: ["./modal-asociar-permisos-escuela.component.scss"],
})
export class ModalAsociarPermisosEscuelaComponent implements OnInit {
  users: any[] = [];
  loadComplete: boolean;
  title: string;
  idOrganization: string;
  isAdmin: boolean;
  action: string;

  constructor(
    public dialogRef: MatDialogRef<ModalAsociarPermisosEscuelaComponent>,
    private userService: UserService,
    private authService: AuthService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.loadDataUser();
  }

  loadDataUser() {
    this.loadComplete = false;

    this.userService.getAll().subscribe((data) => {
      this.users = [];
      for (const user of data) {
        const userOrganizations: any[] = user.idOrganizations;
        const isAdminEscuela = userOrganizations.includes(this.idOrganization);
        user.isAdminEscuela = isAdminEscuela;
        this.users.push(user);
      }
      this.loadComplete = true;
    });
  }

  onChangePermisos(user: any) {
    this.loadComplete = false;

    if (user.isAdminEscuela) {
      this.action = "remove";
    } else {
      this.action = "add";
    }

    this.organizationService
      .modifyOrganizationUsers(this.idOrganization, user.idUser, this.action)
      .subscribe(() => {
        this.loadDataUser();
      });
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload });
  }
}
