import { first } from "rxjs/operators";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserCognito } from "../shared/models/cognito-user";
import { AwsService } from "../shared/services/aws/aws.service";
import "rxjs/add/operator/first";
import { User } from "../shared/models/user";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../shared/services/user/user.service";
import { AuthService } from "../shared/services/auth/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  signInForm: FormGroup;
  setPasswordForm: FormGroup;
  user: UserCognito;
  newPassword: boolean;
  setLoging: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private awsService: AwsService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.newPassword = false;
    this.user = new UserCognito();
    this.signInForm = this.formBuilder.group({
      email: ["", Validators.email],
      password: ["", Validators.compose([Validators.required, Validators.minLength(6)])],
    });
    this.setPasswordForm = this.formBuilder.group(
      {
        newPassword: ["", Validators.compose([Validators.required, Validators.minLength(6)])],
        passwordConfirm: ["", Validators.compose([Validators.required])],
      },
      (form: FormGroup) => {
        return form.get("newPassword").value === form.get("passwordConfirm").value ? null : { mismatch: true };
      }
    );

    const idUser = localStorage.getItem("user.idUser");
    const login = localStorage.getItem("login");
    if (idUser && idUser !== "" && login) {
      this.router.navigate(["/organizations"]);
    }
  }

  ngOnInit() {}

  signIn() {
    if (this.signInForm.valid) {
      this.setLoging = true;
      this.user.email = this.signInForm.value.email;
      this.user.password = this.signInForm.value.password;
      this.awsService
        .getCognitoToken(
          this.user,
          this.newPassword && this.setPasswordForm.valid ? this.setPasswordForm.value.newPassword : ""
        )
        .pipe(first())
        .subscribe(
          (response) => {
            localStorage.setItem("login", JSON.stringify(true));
            this.redirect(response, "cognito");
          },
          (error) => {
            if ("newPassword" === error.toString().trim()) {
              this.newPassword = true;
            } else {
              this.snackBar.open("El nombre de usuario o contraseña no coinciden.", "Cerrar", {
                duration: 3000,
              });
            }
            this.setLoging = false;
          }
        );
    }
  }

  private redirect(user, type) {
    const token = user.token;
    this.awsService
      .addCognitoCredentials(token, type)
      .pipe(first())
      .subscribe(
        (authorization: any) => {
          this.authService.broadcastLogin(authorization);
          this.userService.getAdmin(authorization.IdentityId).subscribe(
            (data) => {
              if (data && data.values && data.values.length > 0) {
                const parsedUser = new User(
                  data.values[0].name,
                  data.values[0].lastname,
                  data.values[0].email,
                  data.values[0].idUser,
                  data.values[0].sets,
                  data.values[0].role,
                  data.values[0].isAdmin,
                  data.values[0].idOrganizations
                );
                localStorage.setItem("user", JSON.stringify(parsedUser));
                localStorage.setItem("auth.type", type);
                localStorage.setItem("auth.internalToken", token);
                localStorage.setItem("user.idUser", authorization.IdentityId);
                localStorage.setItem("user.Token", authorization.Token);
                this.authService.setUser(parsedUser);
                this.router.navigate(["/organizations"]);
              } else {
                this.snackBar.open("No tienes permisos suficientes para ingresar a la administración.", "Cerrar", {
                  duration: 3000,
                });
                this.setLoging = false;
              }
            },
            (error) => {
              console.log("error", error);
            }
          );
        },
        () => {},
        () => {
          //console.log("Termino");
        }
      );
  }

  ngOnDestroy() {
    this.setLoging = false;
  }
}
