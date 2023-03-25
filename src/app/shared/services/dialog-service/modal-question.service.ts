import {Observable} from 'rxjs';
import {ModalStatisticsComponent} from '../../../sets/statistics/general/modal-statistics/modal-statistics.component';
import {Injectable} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class ModalQuestionService {

  constructor(private dialog: MatDialog) {
  }

  public ModalService(title: string, message: string, idQuestion: string, idCategory: string, from: number): Observable<any> {
    let dialogRef: MatDialogRef<ModalStatisticsComponent>;
    dialogRef = this.dialog.open(ModalStatisticsComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.idQuestion = idQuestion;
    dialogRef.componentInstance.idCategory = idCategory;
    dialogRef.componentInstance.from = from;

    return dialogRef.afterClosed();
  }
}
