export class Action {
  idUser: string;
  type: string;
  idQuestion: string;
  idCategory: string;
  idSet: string;
  idAlternative: string;
  idDevice: string;
  appVersion: string;
  time: number;
  createdAt: number;
  correct: boolean;

  public static parse(item: any): Action {
    const action = new Action();
    action.idUser = item.idUser;
    action.createdAt = item.createdAt;
    action.type = item.type;
    action.appVersion = item.appVersion;

    if (action.type === 'answer') {
      action.idSet = item.idSet;
      action.idCategory = item.idCategory;
      action.idQuestion = item.idQuestion;
      action.correct = item.correct;
      action.idAlternative = item.idAlternative;
      action.time = item.time;
      action.idDevice = item.idDevice;
    }
    return action;
  }

  constructor() {
  }
}
