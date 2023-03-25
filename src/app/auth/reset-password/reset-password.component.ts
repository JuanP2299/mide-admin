import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AwsService } from "../../shared/services/aws/aws.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  step: number;
  loading: boolean;
  forgotForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private awsService: AwsService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.step = 1;
    this.loading = false;
    this.forgotForm = formBuilder.group({ email: ["", Validators.email] });
    this.passwordForm = formBuilder.group(
      {
        confirmCode: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
        password: ["", Validators.compose([Validators.required, Validators.minLength(6)])],
        passwordConfirm: ["", Validators.compose([Validators.required])],
      },
      (form: FormGroup) => {
        return form.get("password").value === form.get("passwordConfirm").value ? null : { mismatch: true };
      }
    );
  }

  sendMail() {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.awsService.forgotPassword(this.forgotForm.value.email).subscribe(
        () => {
          this.loading = false;
          this.step = 2;
        },
        () => {
          this.snackBar.open("El correo electrónico ingresado no tiene una cuenta asociada.", "Cerrar", {
            duration: 3000,
          });
          this.loading = false;
        }
      );
    }
  }

  changePassword() {
    if (
      this.passwordForm.valid &&
      this.passwordForm.get("password").value === this.passwordForm.get("passwordConfirm").value
    ) {
      this.loading = true;
      this.awsService
        .confirmForgotPassword(
          this.forgotForm.value.email,
          this.passwordForm.value.password,
          this.passwordForm.value.confirmCode
        )
        .subscribe(
          () => {
            this.step = 3;
          },
          () => {
            this.snackBar.open("El correo electrónico ingresado no tiene una cuenta asociada.", "Cerrar", {
              duration: 3000,
            });
          },
          () => {
            this.loading = false;
          }
        );
    }
  }

  finish() {
    this.router.navigate(["/login"]);
  }

  ngOnInit() {}
}
