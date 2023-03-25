import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { Code } from "../shared/models/codes";
import { Group } from "../shared/models/group";
import { GroupsUsersService } from "../shared/services/groups_users/groups.users.service";
import { GroupService } from "../shared/services/group/group.service";
import { SetService } from "../shared/services/set/set.service";

@Component({
  selector: "app-modal-asociar-grupo",
  templateUrl: "./modal-asociar-grupo.component.html",
  styleUrls: ["./modal-asociar-grupo.component.scss"],
})
export class ModalAsociarGrupoComponent implements OnInit {
  codes: Array<Code>;
  loading: boolean = false;
  title: string;
  name: any;
  idCategory: any;
  escuela: any;
  group: any;
  auxGroup: any;
  groups: any;
  idGroup: any;
  idGroups: any;
  selectedGroup: any;
  opcionSeleccionadoGroups: string;

  constructor(
    public dialogRef: MatDialogRef<ModalAsociarGrupoComponent>,
    private groupsUserService: GroupsUsersService,
    private groupService: GroupService,
    private setService: SetService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.loadGroups();
  }

  loadGroups() {
    try {
      const idOrganization = this.setService.getIdOrganization();
      this.groupsUserService.get(idOrganization).subscribe((data) => {
        const newArray = this.removeDuplicates(data, "name");
        this.groups = newArray;
        this.loading = false;
      });
    } catch (error) {
      console.error(error);
    }
  }

  selectGrupo() {
    this.selectedGroup = this.opcionSeleccionadoGroups;
  }

  createGroup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const group = {
        idCategory: this.idCategory,
        name: this.selectedGroup.name,
        save: true,
      };

      this.loading = true;
      this.groupService.newGroup(group).subscribe(
        () => {
          resolve();
        },
        (error) => reject(error)
      );
    });
  }

  getUsers(idCategory, idGrupo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const idOrganization = this.setService.getIdOrganization();
      this.groupService.get(idCategory, idOrganization, idGrupo).subscribe(
        (data) => {
          if (data && data.values && data.values.length > 0) {
            const auxCodes = [];
            for (const code of data.values) {
              auxCodes.push(Code.parse(code));
            }
            this.codes = auxCodes;
            this.asociarGrupoUsuarios(auxCodes);
          }
          this.closeDialog(this.idGroup[0], "Grupo asociado correctamente.");
          resolve();
        },
        (error) => reject(error)
      );
    });
  }

  async asociarGrupo() {
    try {
      this.loading = true;
      await this.createGroup();
      await this.getGroup(this.idCategory);
      await this.getUsers(this.idCategory, this.selectedGroup.idGroup);
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
  }

  async compareGroup(array, nuevoArray) {
    let arr1 = array.map((e) => e.idGroup);
    let arr2 = nuevoArray.map((e) => e.idGroup);
    this.idGroup = arr2.filter((item) => arr1.indexOf(item) < 0);
  }

  async getGroup(idCategory): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const idOrganization = this.setService.getIdOrganization();
      this.groupService.get(idCategory, idOrganization).subscribe(
        (data) => {
          const auxGroup = [];
          if (data && data.values && data.values.length > 0) {
            for (const group of data.values) {
              auxGroup.push(Group.parse(group));
            }
            this.auxGroup = auxGroup;
            this.compareGroup(this.group, auxGroup);
          }
          resolve();
        },
        (error) => reject(error)
      );
    });
  }

  async setCodeFromFile(code: any): Promise<void> {
    const idOrganization = this.setService.getIdOrganization();
    const user = {
      email: code.email,
      idCategory: this.idCategory,
      idOrganization: idOrganization,
      limitAt: code.limitAt,
      idGroup: this.idGroup[0],
      setName: this.selectedGroup.name,
      firstName: code.firstName,
      lastName: code.lastName,
    };
    return this.groupService.genCode(user).toPromise();
  }

  async asociarGrupoUsuarios(users) {
    for (let user of users) {
      this.setCodeFromFile(user);
    }
  }

  removeDuplicates(data, prop) {
    const newArray = [];
    const lookupObject = {};

    for (let i in data) {
      lookupObject[data[i][prop]] = data[i];
    }

    for (let i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  closeDialog(reload: boolean, msg: any) {
    this.dialogRef.close({ reload: reload, msg: msg });
  }
}
