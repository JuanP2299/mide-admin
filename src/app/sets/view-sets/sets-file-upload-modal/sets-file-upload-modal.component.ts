import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as XLSX from "xlsx";
import * as uuid from "uuid/v4";
import { Change } from "../../../shared/models/change";
import { Question } from "../../../shared/models/question";
import { Alternative } from "../../../shared/models/alternative";
import { Set } from "../../../shared/models/set";
import { SetService } from "../../../shared/services/set/set.service";

@Component({
  selector: "app-sets-file-upload-modal",
  templateUrl: "./sets-file-upload-modal.component.html",
  styleUrls: ["./sets-file-upload-modal.component.scss"],
})
export class SetsFileUploadModalComponent {
  title: string;
  message: string;
  set: Set;
  idCategory: any;
  fileData: any = [];
  changes: Array<Change> = [];
  loading: boolean;
  loadComplete: boolean;

  constructor(
    public dialogRef: MatDialogRef<SetsFileUploadModalComponent>,
    private snackBar: MatSnackBar,
    private setService: SetService
  ) {
    this.loading = false;
    this.loadComplete = false;
  }

  uploadFile() {
    this.loading = true;
    let isHeaderValid = false;

    for (let index = 0; index < this.fileData.length; index++) {
      let row = this.fileData[index];
      if (index === 0) {
        isHeaderValid = this.validateHeaderNames(row);
        if (!isHeaderValid) {
          this.loading = false;
          this.snackBar.open("El archivo no respeta el formato de carga.", "Cerrar", { duration: 3000 });
          break;
        }
      } else {
        const change = this.createChange(row);
        this.changes.push(change);
      }
    }
    if (isHeaderValid) {
      this.closeDialog(true);
    }
  }

  validateHeaderNames(row: any) {
    let isValid = true;
    if (row.length > 2) {
      row.forEach((element: string, index: number) => {
        const value = element.toLowerCase();
        switch (index) {
          case 0:
            isValid = isValid && value.includes("enunciado");
            break;
          case 1:
            isValid = isValid && value.includes("correcta");
            break;
          default:
            isValid = isValid && value.includes("incorrecta");
            break;
        }
      });
    } else {
      isValid = false;
    }
    return isValid;
  }

  createChange(row: any) {
    const change = new Change(this.setService.getIdOrganization());
    const newQuestion = new Question();
    newQuestion.idQuestion = uuid();
    row.forEach((element, index) => {
      const alternative = new Alternative();
      alternative.idAlternative = uuid();

      switch (index) {
        case 0:
          newQuestion.title = element;
          break;
        case 1:
          alternative.correct = true;
          alternative.text = element;
          newQuestion.alternatives.push(alternative);
          break;
        default:
          alternative.correct = false;
          alternative.text = element;
          newQuestion.alternatives.push(alternative);
          break;
      }
      newQuestion.idCategory = this.idCategory;
      change.idSet = this.set.idCategory;
      change.createdAt = this.set.updatedAt + 1;
      change.type = "question-" + newQuestion.idQuestion + "-" + change.createdAt;
      change.action = "create";
      change.question = newQuestion;
    });
    return change;
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error("No se puede cargar más de un archivo");
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: "binary" });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.fileData = XLSX.utils.sheet_to_json(ws, { header: 1 });
    };
    reader.readAsBinaryString(target.files[0]);
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload, changes: this.changes });
  }
}
