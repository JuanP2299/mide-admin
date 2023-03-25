import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { UserService } from "../shared/services/user/user.service";
import { User } from "../shared/models/user";
import { DialogServiceService } from "../shared/services/dialog-service/dialog-service.service";
import { AuthService } from "../shared/services/auth/auth.service";
import { UserCognito } from "../shared/models/cognito-user";

@Component({
  selector: "app-permisos",
  templateUrl: "./permisos.component.html",
  styleUrls: ["./permisos.component.scss"],
})
export class PermisosComponent implements OnInit {
  users: any[];
  userLogued: User;
  pagination: number = 1;
  action: string;
  loadComplete: boolean;
  search: string;
  listAux: Array<User> = [];

  constructor(
    private userService: UserService,
    private dialog: DialogServiceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDataUser();
  }

  loadDataUser() {
    const user: User = JSON.parse(localStorage.getItem("user"));
    this.userLogued = user;
    this.userService.getAll().subscribe((data) => {
      this.users = data;
      this.listAux = data;
      this.loadComplete = true;
    });
  }

  onChangePermisos(event, user: User) {
    if (user.isAdmin == "1") {
      this.action = "remove";
    } else {
      this.action = "add";
    }
    this.openAsociarUsuariosDialog(user.idUser, this.action);
  }

  openAsociarUsuariosDialog(idUser: any, action: string) {
    this.dialog
      .confirmarPermisos("Confirm Dialog", idUser, action)
      .subscribe(async (res) => {
        if (res.reload) {
          this.loadComplete = false;
          this.loadDataUser();
        }
      });
  }

  searchFn(text: string) {
    text = text.toLowerCase();
    this.users = this.listAux;
    this.users = this.users.filter((item) => {
      if (
        item.name.toLowerCase().indexOf(text) > -1 ||
        item.email.toLowerCase().indexOf(text) > -1
      ) {
        return item;
      }
    });
  }

  setPagination(event: any) {
    this.pagination = event;
  }
}
