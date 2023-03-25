import {Observable} from 'rxjs';
import {DeleteGroupComponent} from '../../../sets/groups/delete-group/delete-group.component';
import {DeleteCodeComponent} from '../../../sets/groups/delete-code/delete-code.component';
import {Injectable} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogDeleteService {

  constructor(private dialog: MatDialog) {
  }

  public confirm(title: string, message: string, group: any, idCategory): Observable<any> {
    let dialogRef: MatDialogRef<DeleteGroupComponent>;
    dialogRef = this.dialog.open(DeleteGroupComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.idCategory = idCategory;
    dialogRef.componentInstance.group = group;

    return dialogRef.afterClosed();
  }

  public deleteCode(title: string, message: string, code: any, idCategory): Observable<any> {
    let dialogRef: MatDialogRef<DeleteCodeComponent>;
    dialogRef = this.dialog.open(DeleteCodeComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.idCategory = idCategory;
    dialogRef.componentInstance.code = code;

    return dialogRef.afterClosed();
  }
}
