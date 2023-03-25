import { Observable } from 'rxjs';
import { EditGroupComponent } from '../../../sets/groups/edit-group/edit-group.component';
import { DeleteSetComponent } from '../../../sets/list-sets/delete-set/delete-set.component';
import { SetsFileUploadModalComponent } from '../../../sets/view-sets/sets-file-upload-modal/sets-file-upload-modal.component';
import { DeleteModalComponent } from '../../../sets/view-sets/delete-modal/delete-modal.component';
import { ModalConfirmationComponent } from '../../../sets/resume/modal-confirmation/modal-confirmation.component';
import { ModalAsociarUsuariosComponent } from '../../../modal-asociar-usuarios/modal-asociar-usuarios.component';
import { ModalAsociarGrupoComponent } from '../../../modal-asociar-grupo/modal-asociar-grupo.component';
import { ModalConfirmarPermisosComponent } from '../../../permisos/modal-confirmar-permisos/modal-confirmar-permisos.component';
import { ModalAsociarPermisosEscuelaComponent } from '../../../permisos/modal-asociar-permisos-escuela/modal-asociar-permisos-escuela.component';
import { ModalAsociarProfesorComponent } from '../../../sets/groups/modal-asociar-profesor/modal-asociar-profesor.component';
import { FilesComponent } from '../../../sets/files/files.component';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Set } from '../../models/set';

@Injectable({
  providedIn: 'root',
})
export class DialogServiceService {
  constructor(private dialog: MatDialog) {}

  public confirm(title: string, message: string, group: any, idCategory): Observable<any> {
    let dialogRef: MatDialogRef<EditGroupComponent>;
    dialogRef = this.dialog.open(EditGroupComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.group = group;
    dialogRef.componentInstance.idCategory = idCategory;
    return dialogRef.afterClosed();
  }

  public confirmDeleteSet(title: string, message: string, idCategory: string): Observable<any> {
    let dialogRef: MatDialogRef<DeleteSetComponent>;
    dialogRef = this.dialog.open(DeleteSetComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.idCategory = idCategory;

    return dialogRef.afterClosed();
  }

  public confirmDeleteTypeChange(
    title: string,
    message: string,
    type: string,
    idSet: string,
    change?: any,
    exist?: boolean,
    activeUpdateCat?: boolean
  ): Observable<any> {
    let dialogRef: MatDialogRef<DeleteModalComponent>;

    dialogRef = this.dialog.open(DeleteModalComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.type = type;
    dialogRef.componentInstance.idSet = idSet;
    dialogRef.componentInstance.change = change;
    dialogRef.componentInstance.exist = exist;
    dialogRef.componentInstance.activeUpdateCat = activeUpdateCat;

    return dialogRef.afterClosed();
  }

  public confirmationChangesDialog(idSet: string, createdAt: number): Observable<any> {
    let dialogRef: MatDialogRef<ModalConfirmationComponent>;
    dialogRef = this.dialog.open(ModalConfirmationComponent);
    dialogRef.componentInstance.idSet = idSet;
    dialogRef.componentInstance.createdAt = createdAt;
    return dialogRef.afterClosed();
  }

  public uploadFile(title: string, message: string, group: any, idCategory, set: Set): Observable<any> {
    let dialogRef: MatDialogRef<SetsFileUploadModalComponent>;
    dialogRef = this.dialog.open(SetsFileUploadModalComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.idCategory = idCategory;
    dialogRef.componentInstance.set = set;
    return dialogRef.afterClosed();
  }

  public asociarUsuarios(title: string, message: string, group: any, idCategory, set: Set): Observable<any> {
    let dialogRef: MatDialogRef<ModalAsociarUsuariosComponent>;
    dialogRef = this.dialog.open(ModalAsociarUsuariosComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.idCategory = idCategory;
    dialogRef.componentInstance.set = set;
    return dialogRef.afterClosed();
  }

  public setUploadFile(title: string, idCategory: any): Observable<any> {
    let dialogRef: MatDialogRef<FilesComponent>;
    dialogRef = this.dialog.open(FilesComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.idCategory = idCategory;
    return dialogRef.afterClosed();
  }

  public confirmarPermisos(title: string, idUser: any, action: string): Observable<any> {
    let dialogRef: MatDialogRef<ModalConfirmarPermisosComponent>;
    dialogRef = this.dialog.open(ModalConfirmarPermisosComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.action = action;
    dialogRef.componentInstance.idUser = idUser;
    return dialogRef.afterClosed();
  }
  public asociarPermisosEscuelaUsuarios(title: string, idOrganization: any): Observable<any> {
    let dialogRef: MatDialogRef<ModalAsociarPermisosEscuelaComponent>;
    dialogRef = this.dialog.open(ModalAsociarPermisosEscuelaComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.idOrganization = idOrganization;
    return dialogRef.afterClosed();
  }

  public asociarUsuarioProfesor(title: string, idUser: any, action: string): Observable<any> {
    let dialogRef: MatDialogRef<ModalAsociarProfesorComponent>;
    dialogRef = this.dialog.open(ModalAsociarProfesorComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.action = action;
    dialogRef.componentInstance.idUser = idUser;
    return dialogRef.afterClosed();
  }

  public asociarGrupo(title: string , idCategory: any, group:any): Observable<any> {
    let dialogRef: MatDialogRef<ModalAsociarGrupoComponent>;
    dialogRef = this.dialog.open(ModalAsociarGrupoComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.group = group;
    dialogRef.componentInstance.idCategory = idCategory;
    return dialogRef.afterClosed();
  }
}
