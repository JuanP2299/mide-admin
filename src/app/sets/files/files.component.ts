
import {first} from 'rxjs/operators';
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

import { AwsService } from "../../shared/services/aws/aws.service";

@Component({
  selector: "app-files",
  templateUrl: "./files.component.html",
  styleUrls: ["./files.component.scss"],
})
export class FilesComponent implements OnInit {
  title: String;
  loading: boolean;
  message: String;
  idCategory: Number;
  toFile: String;

  constructor(public dialogRef: MatDialogRef<FilesComponent>, private awsService: AwsService) {}

  ngOnInit() {}

  uploadService(file) {
    this.loading = true;
    this.awsService
      .uploadObjectS3(file, this.idCategory, false).pipe(
      first())
      .subscribe((file) => {
        if (file) {
          this.loading = false;
          this.closeDialog(true);
        }
      });
  }

  uploadFile() {
    const file = this.toFile[0];
    this.uploadService(file);
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    this.toFile = event.target.files;
    if (target.files.length !== 1) {
      throw new Error("No se puede cargar más de un archivo");
    }
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload, file: this.toFile });
  }
}
