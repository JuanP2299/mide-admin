import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";

import { Code } from "../../../shared/models/codes";
import { Group } from "../../../shared/models/group";
import { Set } from "../../../shared/models/set";
import { GroupService } from "../../../shared/services/group/group.service";
import { SetService } from "../../../shared/services/set/set.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { DialogServiceService } from "../../../shared/services/dialog-service/dialog-service.service";
import { DialogDeleteService } from "../../../shared/services/dialog-service/dialog-delete-service.service.service";
import * as XLSX from "xlsx";
import * as dateFormat from "format-datetime";

@Component({
  selector: "app-view-group",
  templateUrl: "./view-group.component.html",
  styleUrls: ["./view-group.component.scss"],
})
export class ViewGroupComponent implements OnInit {
  @ViewChild("inputFile", { static: false }) fileInput: ElementRef;
  set: Set;
  group: Group;
  codes: Array<Code>;
  codeForm: FormGroup;
  search: string;
  listAux: Array<Code>;
  loadComplete: boolean;
  myFilter: any;
  pagination: number;
  serializedDate: any;
  fileData: any = [];
  fileUploadValid: boolean = false;
  codesFromFile: Array<any> = [];
  action: string;

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private setService: SetService,
    private snackBar: MatSnackBar,
    private breadcrumbService: BreadcrumbService,
    private dialogDeleteService: DialogDeleteService,
    private dialog: DialogServiceService,
    private router: Router
  ) {
    const user: any = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.serializedDate = new FormControl(
        new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toISOString()
      );
      this.pagination = 1;
      this.myFilter = (d: Date): boolean => {
        const today = new Date();
        return d > today;
      };

      this.codes = [];
      this.listAux = [];
      this.initForm();
      this.route.parent.parent.params.subscribe((setParams) => {
        const sets: Array<Set> = JSON.parse(localStorage.getItem("sets"));
        if (sets && sets.length > 0) {
          for (const set of sets) {
            if (set.idCategory === setParams.idSet) {
              this.set = set;
              this.route.params.subscribe((groupParams) => {
                const groups = JSON.parse(
                  localStorage.getItem("groups-" + this.set.idCategory)
                );
                if (groups && groups.length > 0) {
                  for (const group of groups) {
                    if (group.idGroup === groupParams.idGroup) {
                      this.group = group;
                      this.breadcrumbService.setBreadCrumb([
                        { name: "Home", url: "/sets" },
                        {
                          name: "Conjunto -" + this.set.name,
                          url: "/sets/" + this.set.idCategory,
                        },
                        {
                          name: "Listado de Grupos",
                          url:
                            "/sets/" + this.set.idCategory + "/groups-actions",
                        },
                        {
                          name: "Grupo-" + this.group.name,
                          url:
                            "/sets/" +
                            this.set.idCategory +
                            "/groups-actions/view/" +
                            this.group.idGroup,
                        },
                      ]);
                      this.breadcrumbService.setBreadCrumbNow([
                        { name: "Administrar usuarios" },
                      ]);
                      this.getCodes();
                      break;
                    }
                  }
                }
              });
              break;
            } else {
            }
          }
        }
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  getCodes() {
    const idOrganization = this.setService.getIdOrganization();
    this.groupService
      .get(this.set.idCategory, idOrganization, this.group.idGroup)
      .subscribe((data) => {
        if (data && data.values && data.values.length > 0) {
          const auxCodes = [];
          for (const code of data.values) {
            auxCodes.push(Code.parse(code));
          }
          this.codes = auxCodes;
          this.listAux = auxCodes;
        }
        this.loadComplete = true;
      });
  }

  async uploadFile() {
    this.loadComplete = false;
    let isHeaderValid = false;

    for (let index = 0; index < this.fileData.length; index++) {
      let row = this.fileData[index];
      if (index === 0) {
        isHeaderValid = this.validateHeaderNames(row);
        if (!isHeaderValid) {
          this.loadComplete = true;
          this.snackBar.open(
            "El archivo no respeta el formato de carga.",
            "Cerrar",
            { duration: 3000 }
          );
          break;
        }
      } else {
        const code = this.createCode(row);
        this.codesFromFile.push(code);
      }
    }
    if (isHeaderValid) {
      for (let code of this.codesFromFile) {
        await this.setCodeFromFile(code);
      }

      this.codeForm.reset();
      this.initForm();
      this.getCodes();
      this.snackBar.open("Cupones asignados correctamente.", "Cerrar", {
        duration: 3000,
      });

      this.loadComplete = true;
    }
  }

  validateHeaderNames(row: any) {
    let isValid = true;
    row.forEach((element: string, index: number) => {
      const value = element.toLowerCase();
      value.trim();
      switch (index) {
        case 0:
          isValid = isValid && value.includes("nombre");
          break;
        case 1:
          isValid = isValid && value.includes("apellido");
          break;
        case 2:
          isValid = isValid && value.includes("correo");
          break;
        case 3:
          isValid = isValid && value.includes("vencimiento");
          break;
        default:
          isValid = false;
          break;
      }
    });
    return isValid;
  }

  createCode(row: any) {
    const code = {
      email: row[2].trim(),
      idCategory: this.set.idCategory,
      idOrganization: this.setService.getIdOrganization(),
      limitAt: new Date(row[3]).getTime(),
      idGroup: this.group.idGroup,
      setName: this.set.name,
      firstName: row[0].trim(),
      lastName: row[1].trim(),
    };

    return code;
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error("No se puede cargar más de un archivo");
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {
        type: "binary",
        cellDates: true,
        dateNF: "dd/mm/yyyy;@",
      });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.fileData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.fileUploadValid = true;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  async setCodeFromFile(code: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.groupService.genCode(code).subscribe((data) => {
        if (data) {
          resolve();
        } else {
          this.snackBar.open(
            "Error al generar cupón . Intente nuevamente.",
            "Cerrar",
            {
              duration: 3000,
            }
          );
          reject();
        }
      });
    });
  }

  setCode() {
    if (this.codeForm.valid) {
      const code = {
        email: this.codeForm.value.email.toLowerCase(),
        idCategory: this.set.idCategory,
        idOrganization: this.setService.getIdOrganization(),
        limitAt: this.serializedDate
          ? new Date(this.serializedDate.value).getTime()
          : "",
        idGroup: this.group.idGroup,
        setName: this.set.name,
        firstName: this.codeForm.value.firstName,
        lastName: this.codeForm.value.lastName,
      };
      this.loadComplete = false;
      this.groupService.genCode(code).subscribe((data) => {
        if (data) {
          this.codeForm.reset();
          this.initForm();
          this.getCodes();
          this.snackBar.open(data.msg, "Cerrar", {
            duration: 3000,
          });
        } else {
          this.snackBar.open(
            "Error al generar cupón . Intente nuevamente.",
            "Cerrar",
            {
              duration: 3000,
            }
          );
        }
      });
    }
  }

  initForm() {
    this.codeForm = new FormGroup({
      firstName: new FormControl("", Validators.required),
      lastName: new FormControl("", Validators.required),
      email: new FormControl("", Validators.email),
    });
    const resetDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString();
    this.serializedDate.setValue(resetDate);
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = "";
    }
    this.fileUploadValid = false;
  }

  searchFn(text: string) {
    text = text.toLowerCase();
    this.codes = this.listAux;
    this.codes = this.codes.filter((item) => {
      if (
        item.lastName.toLowerCase().indexOf(text) > -1 ||
        item.email.toLowerCase().indexOf(text) > -1 ||
        item.firstName.toLowerCase().indexOf(text) > -1
      ) {
        return item;
      }
    });
  }

  deleteCode(code: any) {
    this.dialogDeleteService
      .deleteCode("Confirm Dialog Delete", "delete", code, this.set.idCategory)
      .subscribe((res) => {
        if (res) {
          this.codes = res;
        }
      });
  }

  updateDatosUsuario(user) {
    const userModif = {
      email: user.email,
      idCategory: this.set.idCategory,
      idOrganization: this.setService.getIdOrganization(),
      limitAt: user.limitAt,
      idGroup: this.group.idGroup,
      setName: this.set.name,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return userModif;
  }

  openAsociarUsuariosDialog(items: any) {
    this.dialog
      .asociarUsuarios(
        "Confirm Dialog",
        items.name,
        items,
        items.idCategory,
        this.set
      )
      .subscribe(async (res) => {
        if (res.reload) {
          this.loadComplete = false;
          if (res.users) {
            for (let user of res.users) {
              user = this.updateDatosUsuario(user);
              await this.setCodeFromFile(user);
            }
            this.snackBar.open("Cupones asignados correctamente.", "Cerrar", {
              duration: 3000,
            });
          } else {
            this.snackBar.open(
              "El grupo seleccionado no tiene usuarios.",
              "Cerrar",
              {
                duration: 3000,
              }
            );
          }

          this.getCodes();
          this.loadComplete = true;
        }
      });
  }

  onChangeProfesor(event, codes) {
    if (codes.profession == "profesor") {
      this.action = "remove";
    } else {
      this.action = "add";
    }
    this.openAsociarUsuarioProfesorDialog(codes.idUser, this.action);
  }

  openAsociarUsuarioProfesorDialog(user: any, action: string) {
    this.dialog
      .asociarUsuarioProfesor("Confirm Dialog", user, action)
      .subscribe(async (res) => {
        if (res.reload) {
          this.loadComplete = false;
          this.getCodes();
        }
      });
  }

  setPagination(event) {
    this.pagination = event;
  }

  formatDate(date: any) {
    return dateFormat(new Date(date), "dd-MM-yyyy");
  }

  ngOnInit() {}
}
