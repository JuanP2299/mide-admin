import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Organization } from "../shared/models/organization";
import { Set } from "../shared/models/set";
import { SetService } from "../../app/shared/services/set/set.service";
import { GroupService } from "../shared/services/group/group.service";
import { OrganizationService } from "../shared/services/organization/organization.service";
import { Group } from "../shared/models/group";
import { Code } from "../shared/models/codes";
import { User } from "../shared/models/user";
import { Course } from "../shared/models/course";

@Component({
  selector: "app-modal-asociar-usuarios",
  templateUrl: "./modal-asociar-usuarios.component.html",
  styleUrls: ["./modal-asociar-usuarios.component.scss"],
})
export class ModalAsociarUsuariosComponent implements OnInit {
  codes: Array<Code>;
  escuelas: Array<Organization>;
  sets: Array<Set>;
  cursos: Array<Course>;
  groups: Array<Group>;
  listAux: Array<Code>;
  title: string;
  message: string;
  set: Set;
  idCategory: any;
  fileData: any[][] = [];
  loading: boolean;
  loadComplete: boolean;
  opcionSeleccionadoEscuela: string;
  opcionSeleccionadoCurso: string;
  opcionSeleccionadoSet: string;
  opcionSeleccionadoGroup: string;
  selectedSet: string;
  selectedEscuela: string;
  selectedCurso: string;
  selectedGroup: string;
  showSelectGroup: boolean = false;
  showSelectCurso: boolean = false;
  showSelectSet: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalAsociarUsuariosComponent>,
    private setService: SetService,
    private groupService: GroupService,
    private escuelaService: OrganizationService
  ) {
    this.loading = false;
    this.loadComplete = false;
  }

  selectEscuela() {
    this.selectedEscuela = this.opcionSeleccionadoEscuela;
    this.showSelectCurso = true;
    this.getCourses();
  }

  selectCurso() {
    this.selectedCurso = this.opcionSeleccionadoCurso;
    this.showSelectSet = true;
    this.loadSet(this.selectedEscuela);
  }

  selectSet() {
    this.selectedSet = this.opcionSeleccionadoSet;
    this.showSelectGroup = true;
    this.getGroups(this.selectedSet);
  }

  selectGroup() {
    this.selectedGroup = this.opcionSeleccionadoGroup;
  }

  loadSet(idOrganization) {
    const idCourse = this.setService.getIdCourse();
    this.setService.getByIds(idOrganization, idCourse).subscribe((sets) => {
      if (sets && sets.values && sets.values.length > 0) {
        const auxSets = [];
        const syncSets = [];
        for (const set of sets.values) {
          if (set.idCategory !== this.idCategory) {
            const setParsed = Set.parse(set);
            const setOld = Set.getSet(this.sets, setParsed);
            if (setParsed && setOld) {
              if (setParsed.updatedAt !== setOld.updatedAt) {
                syncSets.push(setParsed);
              }
            } else {
              syncSets.push(setParsed);
            }
            auxSets.push(setParsed);
          }
        }
        this.sets = auxSets;
      } else {
        //Aca iria lo que se muestra cuando no existe ningun set activo
      }
    });
  }

  ngOnInit() {
    this.getEscuelas();
  }

  getEscuelas() {
    const user: User = JSON.parse(localStorage.getItem("user"));
    this.escuelaService.getByUser(user.idUser).subscribe((data) => {
      const auxEscuelas = [];
      for (const escuela of data) {
        auxEscuelas.push(Organization.parse(escuela));
      }
      this.escuelas = auxEscuelas;
      this.loadComplete = true;
    });
  }

  getCourses() {
    const courses = this.setService.getCourses();
    if (courses && courses.length) {
      let auxCourses = [];
      for (const course of courses) {
        const courseParsed = Course.parse(course);
        auxCourses.push(courseParsed);
      }
      this.cursos = auxCourses;
    }
  }

  getSets(idOrganization, idCourse) {
    this.setService.getByIds(idOrganization, idCourse).subscribe((sets) => {
      if (sets && sets.values && sets.values.length > 0) {
        const auxSets = [];
        const syncSets = [];
        for (const set of sets.values) {
          if (set.idCategory !== this.idCategory) {
            const setParsed = Set.parse(set);
            const setOld = Set.getSet(this.sets, setParsed);
            if (setParsed && setOld) {
              if (setParsed.updatedAt !== setOld.updatedAt) {
                syncSets.push(setParsed);
              }
            } else {
              syncSets.push(setParsed);
            }
            auxSets.push(setParsed);
          }
        }
        this.sets = auxSets;
      } else {
        //Aca iria lo que se muestra cuando no existe ningun set activo
      }
    });
  }

  async getGroups(idCategory) {
    const idOrganization = localStorage.getItem("idOrganization");
    this.groupService.get(idCategory, idOrganization).subscribe((data) => {
      const auxGroup = [];
      if (data && data.values && data.values.length > 0) {
        for (const group of data.values) {
          auxGroup.push(Group.parse(group));
        }
        this.groups = auxGroup;
      }
      this.loadComplete = true;
    });
  }

  async getUsers(idCategory, idGrupo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const idOrganization = localStorage.getItem("idOrganization");
      this.groupService.get(idCategory, idOrganization, idGrupo).subscribe((data) => {
        if (data && data.values && data.values.length > 0) {
          const auxCodes = [];
          for (const code of data.values) {
            auxCodes.push(Code.parse(code));
          }
          this.codes = auxCodes;
          this.listAux = auxCodes;
        }
        this.loadComplete = true;
        resolve();
      });
    });
  }

  async asociarUsuarios() {
    await this.getUsers(this.selectedSet, this.selectedGroup);
    this.closeDialog(true);
  }

  closeDialog(reload: boolean) {
    this.dialogRef.close({ reload: reload, users: this.codes });
  }
}
