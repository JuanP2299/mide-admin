import { Injectable } from "@angular/core";

import * as AWS from "aws-sdk";
import {
  _CLIENT_ID,
  _IDENTITY_POOL_ID,
  _REGION,
  _USER_POOL_ID,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  REGION,
  environment,
} from "../../../../environments/environment";
import { UserCognito } from "../../models/cognito-user";
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession } from "amazon-cognito-identity-js";
import { Observable, Subject } from "rxjs";
import {
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  ConfirmForgotPasswordRequest,
  ConfirmForgotPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";

@Injectable({
  providedIn: "root",
})
export class AwsService {
  private static getCognitoParametersForIdConsolidation(idTokenJwt: string, type: string): {} {
    let url = "";
    let params = null;

    if (type === "cognito") {
      url = "cognito-idp." + _REGION.toLowerCase() + ".amazonaws.com/" + _USER_POOL_ID;
    } else if (type === "google") {
      url = "accounts.google.com";
    } else if (type === "facebook") {
      url = "graph.facebook.com";
    }

    if (url !== "") {
      const logins = {};
      logins[url] = idTokenJwt;
      params = {
        IdentityPoolId: _IDENTITY_POOL_ID,
        Logins: logins,
      };
    }
    localStorage.setItem("credentials", JSON.stringify(params));
    return params;
  }

  constructor() {}

  initAwsService() {
    AWS.config.region = _REGION;
  }

  async getObjectS3(object: string): Promise<string> {
    return new Promise<string>((res, rej) => {
      const credentials = JSON.parse(localStorage.getItem("credentials"));
      if (credentials) {
        AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials);
        const S3 = new AWS.S3();
        const params = {
          Bucket: environment.production ? "mide-prod" : "mide-dev",
          Key: object,
        };
        S3.getSignedUrl("getObject", params, (err2, data) => {
          if (err2) {
            rej(err2);
          } else {
            res(data);
          }
        });
      }
    });
  }

  uploadObjectS3(file, idSet, isProfilePicture): Observable<string> {
    const source = new Subject<string>();
    const obs = source.asObservable();
    const contenType = file.type;
    const fileExt = file.name.split(".").pop();
    const name = isProfilePicture ? "Profesor_" + idSet + "." + fileExt : idSet + "." + fileExt;
    const credentials = JSON.parse(localStorage.getItem("credentials"));
    if (credentials) {
      const S3 = new AWS.S3({
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        region: REGION,
      });
      const params = {
        Bucket: environment.production ? "mide-files-prod" : "mide-files-dev",
        Key: name,
        Body: file,
        ACL: "public-read",
        ContentType: contenType,
      };
      S3.upload(params, (err2, data) => {
        if (err2) {
          source.error(err2);
        } else {
          source.next(data);
        }
      });
    }
    return obs;
  }

  getCognitoToken(user: UserCognito, newPassword: string = ""): Observable<UserCognito> {
    const authDetail: AuthenticationDetails = new AuthenticationDetails({
      Username: user.email,
      Password: user.password,
    });

    const userPool: CognitoUserPool = new CognitoUserPool({
      ClientId: _CLIENT_ID,
      UserPoolId: _USER_POOL_ID,
    });
    const cognitoUser: CognitoUser = new CognitoUser({
      Username: user.email,
      Pool: userPool,
    });
    const source = new Subject<UserCognito>();
    const obs = source.asObservable();
    AWS.config.update({ accessKeyId: "anything", secretAccessKey: "anything" });
    cognitoUser.authenticateUser(authDetail, {
      onSuccess: (data: CognitoUserSession) => {
        cognitoUser.getUserAttributes((error, attributes) => {
          if (error) {
            source.error(error);
          } else {
            for (const attribute of attributes) {
              if (attribute.getName() === "sub") {
                user.sub = attribute.getValue();
              } else if (attribute.getName() === "name") {
                user.name = attribute.getValue();
              } else if (attribute.getName() === "email_verified") {
                user.emailVerified = attribute.getValue().toLowerCase() === "true";
              }
            }
            user.token = data.getIdToken().getJwtToken();
            source.next(user);
          }
        });
      },
      onFailure: (err) => {
        source.error(err);
      },
      newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
        if (newPassword && newPassword !== "") {
          delete userAttributes.email_verified;
          delete userAttributes.email;
          cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
            onSuccess: (data: CognitoUserSession) => {
              cognitoUser.getUserAttributes((error, attributes) => {
                if (error) {
                  source.error(error);
                } else {
                  for (const attribute of attributes) {
                    if (attribute.getName() === "sub") {
                      user.sub = attribute.getValue();
                    } else if (attribute.getName() === "name") {
                      user.name = attribute.getValue();
                    } else if (attribute.getName() === "email_verified") {
                      user.emailVerified = attribute.getValue().toLowerCase() === "true";
                    }
                  }
                  user.token = data.getIdToken().getJwtToken();
                  source.next(user);
                }
              });
            },
            onFailure: () => {},
          });
        } else {
          source.error("newPassword");
        }
      },
    });
    return obs;
  }

  addCognitoCredentials(idTokenJwt: string, type: string): Observable<any> {
    const params: any = AwsService.getCognitoParametersForIdConsolidation(idTokenJwt, type);
    const source = new Subject<any>();
    const obs = source.asObservable();
    if (params != null) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
      const cognitoIdentity = new AWS.CognitoIdentity();
      cognitoIdentity.getId({ IdentityPoolId: params.IdentityPoolId, Logins: params.Logins }, (err, data) => {
        if (err) {
          source.error(err);
        } else {
          cognitoIdentity.getOpenIdToken(
            {
              IdentityId: data.IdentityId,
              Logins: params.Logins,
            },
            (err2, openId) => {
              if (err2) {
                source.error(err2);
              } else {
                source.next(openId);
              }
            }
          );
        }
      });
    } else {
      source.error("No params");
    }
    return obs;
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    const params: ForgotPasswordRequest = {
      ClientId: _CLIENT_ID,
      Username: email,
    };

    const source = new Subject<ForgotPasswordResponse>();
    const obs = source.asObservable();
    const cognito = new AWS.CognitoIdentityServiceProvider();

    cognito.forgotPassword(params, (err, data: ForgotPasswordResponse) => {
      if (err) {
        source.error(err);
      } else {
        source.next(data);
      }
    });
    return obs;
  }

  confirmForgotPassword(email: string, password: string, code: string): Observable<ConfirmForgotPasswordResponse> {
    const params: ConfirmForgotPasswordRequest = {
      ClientId: _CLIENT_ID,
      ConfirmationCode: code,
      Username: email,
      Password: password,
    };

    const source = new Subject<ConfirmForgotPasswordResponse>();
    const obs = source.asObservable();
    const cognito = new AWS.CognitoIdentityServiceProvider();

    cognito.confirmForgotPassword(params, (err, data: ConfirmForgotPasswordResponse) => {
      if (err) {
        source.error(err);
      } else {
        source.next(data);
      }
    });
    return obs;
  }

  createUser(email: string, name: string, password: string) {
    const source = new Subject<AdminCreateUserResponse>();
    const obs = source.asObservable();
    const credentials = JSON.parse(localStorage.getItem("credentials"));

    if (credentials) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials);
      const cognito = new AWS.CognitoIdentityServiceProvider();

      const params: AdminCreateUserRequest = {
        UserPoolId: _USER_POOL_ID,
        Username: email,
        DesiredDeliveryMediums: [],
        MessageAction: "SUPPRESS",
        TemporaryPassword: password,
        UserAttributes: [
          { Name: "given_name", Value: name },
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
        ],
      };

      cognito.adminCreateUser(params, (err, data: AdminCreateUserResponse) => {
        if (err) {
          source.error(err);
        } else {
          source.next(data);
        }
      });
    }

    return obs;
  }

  recoverSession() {
    const userPool: CognitoUserPool = new CognitoUserPool({
      ClientId: _CLIENT_ID,
      UserPoolId: _USER_POOL_ID,
    });
    const user = JSON.parse(localStorage.getItem("user"));
    const cognitoUser: CognitoUser = new CognitoUser({
      Username: user.email,
      Pool: userPool,
    });

    if (cognitoUser != null) {
      cognitoUser.getSession((err, session: CognitoUserSession) => {
        if (err) {
          console.log("Error recuperando sesión: ", err);
        } else {
          const token = session.getIdToken().getJwtToken();
          this.addCognitoCredentials(token, "cognito").subscribe((authorization) => {
            localStorage.setItem("auth.type", "cognito");
            localStorage.setItem("auth.internalToken", token);
            localStorage.setItem("user.idUser", authorization.IdentityId);
            localStorage.setItem("user.Token", authorization.Token);
          });
        }
      });
    }
  }

  getAllUsers() {
    const source = new Subject<any>();
    const obs = source.asObservable();
    const credentials = JSON.parse(localStorage.getItem("credentials"));

    if (credentials) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials);
      const cognito = new AWS.CognitoIdentityServiceProvider();

      const params = {
        UserPoolId: _USER_POOL_ID,
        AttributesToGet: ["email"],
      };

      cognito.listUsers(params, (err, data: any) => {
        if (err) {
          source.error(err);
        } else {
          source.next(data);
        }
      });
    }

    return obs;
  }

  deleteUser(email: string) {
    const source = new Subject<any>();
    const obs = source.asObservable();
    const credentials = JSON.parse(localStorage.getItem("credentials"));

    if (credentials) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials);
      const cognito = new AWS.CognitoIdentityServiceProvider();

      const params = {
        UserPoolId: _USER_POOL_ID,
        Username: email,
      };

      cognito.adminDeleteUser(params, (err, data: any) => {
        if (err) {
          source.error(err);
        } else {
          source.next(data);
        }
      });
    }

    return obs;
  }

  //get all cognito users
  //   getUsers(): Observable<any> {
  //     const source = new Subject<any>();
  //     const obs = source.asObservable();
  //     const cognito = new AWS.CognitoIdentityServiceProvider();

  //     const params = {
  //       UserPoolId: _USER_POOL_ID,
  //       AttributesToGet: ["email", "name"],
  //       Limit: 60,
  //       PaginationToken: null,
  //     };

  //     cognito.adminListUsers(params, (err, data: any) => {
  //       if (err) {
  //         source.error(err);
  //       } else {
  //         source.next(data);
  //       }
  //     });
  //     return obs;
  //   }

  // return new Promise((resolve, reject) => {
  //     AWS.config.update({ region: USER_POOL_REGION, 'accessKeyId': AWS_ACCESS_KEY_ID, 'secretAccessKey': AWS_SECRET_KEY });
  //     var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  //     cognitoidentityserviceprovider.listUsers(params, (err, data) => {
  //         if (err) {
  //             console.log(err);
  //             reject(err)
  //         }
  //         else {
  //             console.log("data", data);
  //             resolve(data)
  //         }
  //     })
  // });
}
