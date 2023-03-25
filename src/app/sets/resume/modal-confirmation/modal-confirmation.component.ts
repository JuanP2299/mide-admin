import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChangeService } from "../../../shared/services/change/change.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { SetService } from "../../../shared/services/set/set.service";

@Component({
  selector: "app-modal-confirmation",
  templateUrl: "./modal-confirmation.component.html",
  styleUrls: ["./modal-confirmation.component.scss"],
})
export class ModalConfirmationComponent implements OnInit {
  idSet: string;
  createdAt: number;
  active: boolean;

  constructor(
    public dialogRef: MatDialogRef<ModalConfirmationComponent>,
    private snackBar: MatSnackBar,
    private changeService: ChangeService,
    private setService: SetService,
    private authService: AuthService
  ) {
    this.active = true;
  }

  discard() {
    this.active = false;

    this.changeService
      .delete(
        this.setService.getIdOrganization(),
        this.idSet,
        "",
        this.createdAt
      )
      .subscribe(
        () => {},
        () => {},
        () => {
          this.active = true;
          this.closeDialog(true);
        }
      );
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close(reload);
  }

  ngOnInit() {}
}
