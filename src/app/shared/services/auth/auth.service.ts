import { TokenInterceptor } from "./../interceptor/interceptor";
import { environment } from "./../../../../environments/environment";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { AwsService } from "../aws/aws.service";
import { CognitoUser, CognitoUserPool, CognitoUserSession } from "amazon-cognito-identity-js";
import { _CLIENT_ID, _USER_POOL_ID } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private authSource = new Subject<any>();
  public auth = this.authSource.asObservable();

  private userSource = new Subject<any>();
  public user = this.userSource.asObservable();

  constructor(private aws: AwsService) {}

  login(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const userPool: CognitoUserPool = new CognitoUserPool({
        ClientId: _CLIENT_ID,
        UserPoolId: _USER_POOL_ID,
      });
      const cognitoUser: CognitoUser = userPool.getCurrentUser();

      if (cognitoUser != null) {
        cognitoUser.getSession((err, session: CognitoUserSession) => {
          if (!err) {
            const token = session.getIdToken().getJwtToken();

            this.aws.addCognitoCredentials(token, "cognito").subscribe((authorization) => {
              localStorage.setItem("auth.type", "cognito");
              localStorage.setItem("auth.internalToken", token);
              localStorage.setItem("user.idUser", authorization.IdentityId);
              localStorage.setItem("user.Token", authorization.Token);
              this.broadcastLogin(authorization);
              resolve();
            });
          } else {
            reject();
          }
        });
      }
    });
  }

  logout() {
    localStorage.clear();
    this.setUser(null);
  }

  broadcastLogin(authorization) {
    this.authSource.next(authorization);
    localStorage.setItem("user.Token", authorization.Token);
    localStorage.setItem("user.idUser", authorization.IdentityId);
  }

  checkStatus(): boolean {
    let status = false;
    const user = localStorage.getItem("user");
    if (user && user !== "") {
      this.setUser(JSON.parse(user));
      status = true;
    }
    return status;
  }

  setUser(user: any) {
    this.userSource.next(user);
  }

  //
  // logout(): Observable<any> {
  //   const source = new Subject<any>();
  //   const obs = source.asObservable();
  //   this.removeData().first().subscribe(() => {
  //     source.next('Logout');
  //   });
  //   return obs;
  // }
  //
  // removeData(): Observable<any> {
  //   const source = new Subject<any>();
  //   const obs = source.asObservable();
  //   return obs;
  // }
}
