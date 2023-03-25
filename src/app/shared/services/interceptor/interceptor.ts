import { environment } from "./../../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { AuthService } from "../auth/auth.service";
import { from, Observable } from "rxjs";
import { ProgressBarService } from "../progress-bar/progress-bar.service";
import { tap, finalize, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TokenInterceptor implements HttpInterceptor {
  token: string;
  idUser: string;
  constructor(private authService: AuthService, private loadingService: ProgressBarService) {
    this.authService.auth.subscribe((auth) => {
      this.setToken(auth.Token, auth.IdentityId);
    });
    this.setToken(localStorage.getItem("user.Token"), localStorage.getItem("user.idUser"));
  }

  setToken(token: string, idUser: string) {
    this.token = token;
    this.idUser = idUser;
  }

  /**
   * Intercepta la solicitud para agregar el token, si existe
   *
   * @param {HttpRequest<any>} req Request interceptada
   * @param {HttpHandler} next El proximo interceptor o llamada a backend si no existe otro
   * @returns {Observable<HttpEvent<any>>} Observable del evento
   * @memberof InterceptorService
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Empieza la llamada, se muestra spinner
    this.loadingService.setLoadingValue(1);

    if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
      req.body.idUser = this.idUser;
      req.body.identityId = this.idUser;
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: this.token ? this.token : "",
        "Content-Type": "application/json",
      },
      params:
        req.method === "POST" || req.method === "PUT" || req.method === "DELETE"
          ? req.params
          : req.params.set("id_user", this.idUser ? this.idUser : ""),
      body: req.body ? JSON.stringify(req.body) : "",
    });

    // Se procesa la llamada con el token y el iduser
    return next.handle(cloned).pipe(
      catchError((error: any) => {
        return from(this.handleLogin(cloned, next));
      }),
      finalize(() => {
        // Cuando no haya mas llamadas el spinner deja de mostrarse
        this.loadingService.setLoadingValue(-1);
      })
    );
  }

  async handleLogin(req: HttpRequest<any>, next: HttpHandler) {
    this.loadingService.setLoadingValue(1);
    return this.authService
      .login()
      .then(() => {
        this.loadingService.setLoadingValue(1);
        return next
          .handle(
            req.clone({
              setHeaders: {
                Authorization: this.token ? this.token : "",
                "Content-Type": "application/json",
              },
            })
          )
          .toPromise()
          .finally(() => {
            this.loadingService.setLoadingValue(-1);
          });
      })
      .catch(() => {
        throw "";
      })
      .finally(() => {
        this.loadingService.setLoadingValue(-1);
      });
  }
}
