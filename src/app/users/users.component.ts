import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import * as XLSX from "xlsx";
import { AwsService } from "../shared/services/aws/aws.service";
import { UserCognito } from "../shared/models/cognito-user";
import { ProgressBarService } from "../shared/services/progress-bar/progress-bar.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  @ViewChild("inputFile", { static: false }) fileInput: ElementRef;
  fileData: any = [];
  fileUploadValid: boolean = false;
  usersFromFile: Array<any> = [];
  newUserForm: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private awsService: AwsService,
    private loadingService: ProgressBarService
  ) {
    this.newUserForm = this.formBuilder.group({
      email: ["", Validators.compose([Validators.required, Validators.email])],
      name: ["", Validators.required],
      password: ["", Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  ngOnInit() {
    this.awsService.recoverSession();
  }

  async create() {
    if (this.newUserForm.valid) {
      try {
        this.loadingService.setLoadingValue(1);
        let email: string = this.newUserForm.get("email").value;
        let name: string = this.newUserForm.get("name").value;
        let password: string = this.newUserForm.get("password").value;
        email = email.trim().toLowerCase();
        name = name.trim();
        password = password.trim();
        await this.createCognitoUser(email, name, password);
        this.loadingService.setLoadingValue(-1);
        this.newUserForm.reset();
        this.snackBar.open("Usuario creado correctamente.", "Cerrar", {
          duration: 3000,
        });
      } catch (error) {
        let msg = "Ocurrió un error al crear el usuario.";
        if (error.code === "UsernameExistsException") {
          msg = "Error: Ya existe un usuario con ese correo.";
        }

        this.loadingService.setLoadingValue(-1);
        this.snackBar.open(msg, "Cerrar", {
          duration: 3000,
        });
      }
    }
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

  async uploadFile() {
    this.loadingService.setLoadingValue(1);
    let isHeaderValid = false;
    this.usersFromFile = [];

    for (let index = 0; index < this.fileData.length; index++) {
      let row = this.fileData[index];
      if (index === 0) {
        isHeaderValid = this.validateHeaderNames(row);
        if (!isHeaderValid) {
          this.loadingService.setLoadingValue(-1);
          this.snackBar.open("El archivo no respeta el formato de carga.", "Cerrar", { duration: 3000 });
          break;
        }
      } else {
        const userFromFile = this.createUserFromRow(row);
        this.usersFromFile.push(userFromFile);
      }
    }

    if (isHeaderValid) {
      for (let user of this.usersFromFile) {
        await this.createUserFromFile(user);
      }
      this.newUserForm.reset();

      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = "";
      }
      this.fileUploadValid = false;
      this.loadingService.setLoadingValue(-1);
      this.snackBar.open("Planilla procesada correctamente.", "Cerrar", {
        duration: 3000,
      });
    }
  }

  validateHeaderNames(row: any) {
    let isValid = true;
    if (row.length < 5) return false;
    row.forEach((element: string, index: number) => {
      const value = element.toLowerCase() || "";
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
          isValid = true;
          break;
        case 4:
          isValid = isValid && value.includes("contraseña");
          break;
        default:
          isValid = false;
          break;
      }
    });
    return isValid;
  }

  createUserFromRow(row: any) {
    const user = {
      firstName: String(row[0]).trim(),
      lastName: String(row[1]).trim(),
      email: String(row[2]).trim(),
      password: String(row[4]).trim(),
    };
    return user;
  }

  async createUserFromFile(user: any) {
    let newUser: any = {};
    try {
      newUser.email = user.email;
      newUser.name = `${user.firstName} ${user.lastName}`;
      newUser.password = user.password;
      await this.createCognitoUser(newUser.email, newUser.name, newUser.password);
    } catch (e) {
      console.log("Error usuario planilla: ", user);
    }
  }

  async createCognitoUser(email: string, name: string, password: string) {
    this.loadingService.setLoadingValue(1);
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.createCognitoUserAsync(email, name, password);
        const userCognito = new UserCognito();
        userCognito.email = email;
        userCognito.password = password;
        this.awsService.getCognitoToken(userCognito, password).subscribe(
          () => {
            this.loadingService.setLoadingValue(-1);
            resolve();
          },
          (error) => {
            this.loadingService.setLoadingValue(-1);
            reject(error);
          }
        );
      } catch (error) {
        console.log("Error en creacion: ", error);
        this.loadingService.setLoadingValue(-1);
        reject(error);
      }
    });
  }

  async createCognitoUserAsync(email: string, name: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.awsService.createUser(email, name, password).subscribe(
        () => {
          resolve();
        },
        (error) => {
          console.log("Error rejected: ", error);
          reject(error);
        }
      );
    });
  }

  //Obtenemos todos los usuarios de cognito para luego borrarlos
  //get all cognito users
  // getUsers() {
  //   let usuarios;
  //   this.awsService.getAllUsers().subscribe(
  //     (data) => {
  //       console.log("USUARIOS: ", data);
  //       usuarios = data;
  //       this.deleteUsers(usuarios.Users);
  //     },
  //     (error) => {
  //       console.log("Error: ", error);
  //       this.awsService.recoverSession();
  //     }
  //   );
  // }

  //Borrar todos los usuarios de cognito menos los que diga el array de emails
  // deleteUsers(users: any) {
  //   const emails = [
  //     "nellyfigueroae@gmail.com",
  //     "agmontesdioca@gmail.com",
  //     "rodrigochav23@gmail.com",
  //     "rjmansill@gmail.com",
  //     "AGMontesdioca@gmail.com",
  //     "dagomez.mat@gmail.com",
  //     "ramirocaram@gmail.com",
  //   ];
  //   for (let user of users) {
  //     if (emails.indexOf(user.Username) === -1) {
  //       this.awsService.deleteUser(user.Username).subscribe(
  //         (data) => {
  //           console.log("BORRADO OK: ", data);
  //         },
  //         (error) => {
  //           console.log("Error: ", error);
  //           this.awsService.recoverSession();
  //         }
  //       );
  //       console.log("EMAIL A BORRAR: ", user.Username);
  //     } else {
  //       console.log("EMAIL NO BORRAR: ", user.Username);
  //     }
  //   }
  // }
}
