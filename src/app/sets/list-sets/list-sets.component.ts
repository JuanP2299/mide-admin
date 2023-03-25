import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import "rxjs/add/operator/first";
import * as uuid from "uuid/v4";
import { AuthService } from "../../shared/services/auth/auth.service";
import { SetService } from "../../shared/services/set/set.service";
import { ProgressBarService } from "../../shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "../../shared/services/breadcrumb/breadcrumb.service";
import { UtilsService } from "../../shared/services/utils/utils.service";
import { DialogServiceService } from "../../shared/services/dialog-service/dialog-service.service";
import { UserCognito } from "../../shared/models/cognito-user";
import { Set } from "../../shared/models/set";
import { environment } from "../../../environments/environment";
import { AwsService } from "../../shared/services/aws/aws.service";

@Component({
  selector: "app-list-sets",
  templateUrl: "./list-sets.component.html",
  styleUrls: ["./list-sets.component.scss"],
})
export class ListSetsComponent {
  sets: Array<Set>;
  filterSets: Array<Set>;
  idOrganization: string;
  idCourse: string;
  createSet: Set;
  setForm: FormGroup;
  loading: boolean;
  showActive: boolean = false;
  toFile: String;
  hasImage: boolean = false;
  asignaturas = [
    "LENGUAJE",
    "MATEMÁTICAS",
    "HISTORIA",
    "CIENCIAS",
    "INGLÉS",
    "TECNOLOGÍA",
    "ARTES",
    "MÚSICA",
    "ORIENTACIÓN",
    "RELIGIÓN",
    "EDUCACIÓN_FÍSICA",
    "FÍSICA",
    "OTRO",
  ];
  modos = [
    { value: "practica", text: "PRÁCTICA" },
    { value: "evaluacion", text: "EVALUACIÓN" },
  ];
  intentos = [
    { value: 1, text: "1" },
    { value: 2, text: "2" },
    { value: 3, text: "3" },
    { value: 4, text: "4" },
    { value: 5, text: "5" },
  ];
  duraciones = [
    { value: 15, text: "15 min" },
    { value: 30, text: "30 min" },
    { value: 45, text: "45 min" },
    { value: 60, text: "1 hora" },
    { value: 90, text: "1 hora 30 min" },
    { value: 120, text: "2 horas" },
  ];
  isOtros: boolean = false;
  evaluacion: boolean = false;
  selectedAsignatura: String;
  selectedModo: String;

  coloresAsignatura = [
    {
      LENGUAJE: "#271C1C",
      MATEMÁTICAS: "#C042CC",
      HISTORIA: "#348ACE",
      CIENCIAS: "#38A544",
      INGLÉS: "#CB341D",
      TECNOLOGÍA: "#CF8916",
      ARTES: "#AD7210",
      MÚSICA: "#1808B9",
      ORIENTACIÓN: "#3F4363",
      RELIGIÓN: "#1425B5",
      EDUCACIÓN_FÍSICA: "#3DD409",
      FÍSICA: "#7CAE6B",
    },
  ];

  constructor(
    private authService: AuthService,
    private setService: SetService,
    private loadingService: ProgressBarService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private utils: UtilsService,
    private router: Router,
    private dialog: DialogServiceService,
    private snackBar: MatSnackBar,
    private awsService: AwsService
  ) {
    this.showActive = false;
    this.sets = [];
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    this.sets = JSON.parse(localStorage.getItem("sets"));
    this.filterSets = localStorage.getItem("sets")
      ? JSON.parse(localStorage.getItem("sets"))
      : [];
    this.idOrganization = this.setService.getIdOrganization();
    this.idCourse = this.setService.getIdCourse();
    if (JSON.parse(localStorage.getItem("login")) && user) {
      if (this.idOrganization) {
        this.loading = true;
        this.breadcrumbService.setBreadCrumb([{ name: "Home", url: "/set" }]);
        this.getOrganizationSets();
        this.initForm();
      } else {
        this.router.navigate(["/organizations"]);
      }
    } else {
      this.router.navigate(["/login"]);
    }
  }

  changeValueAsignatura(value) {
    if (value == "OTRO") {
      this.isOtros = true;
    } else {
      this.isOtros = false;
    }
  }

  changeValueModo(value) {
    if (value == "evaluacion") {
      this.evaluacion = true;
    } else {
      this.evaluacion = false;
    }
  }

  getColor(asignatura) {
    switch (asignatura) {
      case "LENGUAJE":
        return "#271C1C";
      case "MATEMÁTICAS":
        return "#C042CC";
      case "HISTORIA":
        return "#348ACE";
      case "CIENCIAS":
        return "#38A544";
      case "INGLÉS":
        return "#CB341D";
      case "TECNOLOGÍA":
        return "#38A544";
      case "ARTES":
        return "#AD7210";
      case "MÚSICA":
        return "#1808B9";
      case "ORIENTACIÓN":
        return "#3F4363";
      case "RELIGIÓN":
        return "#1425B5";
      case "EDUCACIÓN_FÍSICA":
        return "#3DD409";
      case "FÍSICA":
        return "#7CAE6B";
      default:
        return "#f7a700";
    }
  }

  initForm() {
    this.setForm = this.formBuilder.group({
      name: ["", Validators.required],
      desc: ["", Validators.required],
      createdBy: ["", Validators.required],
      years: ["", Validators.required],
      asignatura: ["", Validators.required],
      modo: ["", Validators.required],
      duracion: ["", Validators.required],
      intento: ["", Validators.required],
      newAsignature: ["", []],
      disclaimer: ["", []],
      video: [
        "",
        Validators.pattern(
          "(?:http|https)://www.youtube.com/watch?.*v=[a-zA-Z0-9]+.*"
        ),
      ],
      url: [
        "",
        Validators.pattern(
          "(http|https)://(www.)?[a-zA-Z0-9]+.[a-zA-Z0-9()]{2,}[a-zA-Z0-9-/=@%&~+?*.!#$^()]*"
        ),
      ],
    });
    this.setForm.controls.modo.setValue(this.modos[0].value);
    this.setForm.controls.duracion.setValue(this.duraciones[0].value);
    this.setForm.controls.intento.setValue(this.intentos[0].value);
  }

  getOrganizationSets() {
    this.showActive = false;

    if (this.idOrganization && this.idCourse) {
      this.setService
        .getByIds(this.idOrganization, this.idCourse)
        .subscribe((sets) => {
          if (sets && sets.values && sets.values.length > 0) {
            const auxSets = [];
            const syncSets = [];
            for (const set of sets.values) {
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

            this.sets = auxSets;
            this.filterSets = auxSets;
            localStorage.setItem("sets", JSON.stringify(this.sets));
          } else {
            this.sets = [];
            this.filterSets = [];
            localStorage.setItem("sets", JSON.stringify([]));
            this.showActive = true;
          }

          this.loading = false;
        });
    }
  }

  search(term: string) {
    if (term !== "") {
      this.sets = this.filterSets.filter(
        (item) =>
          this.utils
            .removeDiacritics(item.name)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1 ||
          this.utils
            .removeDiacritics(item.desc)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1 ||
          this.utils
            .removeDiacritics(item.years)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1 ||
          this.utils
            .removeDiacritics(item.createdBy)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1
      );
    } else {
      this.sets = this.filterSets;
    }
  }

  add() {
    this.createSet = new Set();
    this.createSet.idCategory = uuid();
    this.createSet.idOrganization = this.idOrganization;
    this.createSet.idCourse = this.idCourse;
    this.initForm();
  }

  cancelAdd() {
    this.createSet = null;
  }

  save() {
    if (this.setForm.valid) {
      this.loading = true;
      this.createSet.name = this.setForm.get("name").value;
      this.createSet.desc = this.setForm.get("desc").value;
      this.createSet.createdBy = this.setForm.get("createdBy").value;
      this.createSet.years = this.setForm.get("years").value;
      this.createSet.type = "draft";
      this.createSet.image = "assets/images/eunacom.svg";
      this.createSet.color = "black";
      this.createSet.disclaimer = this.setForm.get("disclaimer").value;
      if (this.setForm.get("asignatura").value == "OTRO") {
        this.createSet.asignatura = this.setForm.get("newAsignature").value;
      } else {
        this.createSet.asignatura = this.setForm.get("asignatura").value;
      }
      this.createSet.mode = this.setForm.get("modo").value;
      if (this.createSet.mode == "evaluacion") {
        this.createSet.duration = this.setForm.get("duracion").value;
        this.createSet.attempts = this.setForm.get("intento").value;
      }
      this.createSet.video = this.setForm.get("video").value;
      if (this.createSet.video != "") {
        this.createSet.video = this.getIdVideo(this.createSet.video);
      }
      this.createSet.url = this.setForm.get("url").value;
      this.saveData(this.createSet);
    }
  }

  getIdVideo(video: string) {
    let idVideo = video.split("v=")[1];
    const ampersandPosition = idVideo.indexOf("&");
    if (ampersandPosition != -1) {
      idVideo = idVideo.substring(0, ampersandPosition);
    }

    return idVideo;
  }

  deleteSet(set: Set) {
    this.dialog
      .confirmDeleteSet(
        "Borrar set",
        "Se borrara el set seleccionado",
        set.idCategory
      )
      .subscribe((res) => {
        if (res) {
          this.sets = res;
        }
      });
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    this.toFile = event.target.files;
    this.hasImage = true;
    if (target.files.length !== 1) {
      throw new Error("No se puede cargar más de un archivo");
    }
  }

  uploadService(file, id) {
    this.loading = true;
    this.awsService.uploadObjectS3(file, id, true).subscribe(() => {});
  }

  saveData(set: Set) {
    let setId = set.idCategory;
    const bucketUrl = environment.production
      ? "mide-files-prod"
      : "mide-files-dev";
    if (this.hasImage) {
      const file = this.toFile[0];
      this.uploadService(file, set.idCategory);
      // Acá asumimos solo arhivos jpg por eso está hardcoded el .jpg, a futuro podríamos contemplar otros formatos
    } else {
      setId = "Default";
    }
    set.fotoProfesor = `https://${bucketUrl}.s3.amazonaws.com/Profesor_${setId}.jpg`;

    this.setService.create(set).subscribe(
      (resp) => {
        if (resp && resp.values && resp.values.length > 0) {
          this.snackBar.open("Conjunto añadido correctamente", "Cerrar", {
            duration: 3000,
          });
        } else {
          this.snackBar.open("Error: inténtelo nuevamente", "Cerrar", {
            duration: 3000,
          });
        }
      },
      () => {},
      () => {
        this.createSet = null;
        this.getOrganizationSets();
      }
    );
  }

  goToCourses() {
    this.router.navigate([
      "organizations",
      this.setService.getIdOrganization(),
    ]);
  }
  getSetMode(setAux) {
    let setmode;
    setAux.mode == undefined || setAux.mode == "practica"
      ? (setmode = "Práctica")
      : (setmode = "Evaluación");
    return setmode;
  }
}
