import {Alternative} from './alternative';

export class Question {
  idCategory: string;
  idQuestion: string;
  idQuestionType: string;
  title: string;
  number: number;
  alternatives: Array<Alternative>;
  type: string;

  public static parse(item: any): Question {
    const question = new Question();
    question.idCategory = item.idCategory;
    question.idQuestionType = item.idQuestionType;
    question.idQuestion = item.idQuestion;
    question.title = item.title;
    question.number = item.number ? item.number : 0;
    question.alternatives = [];

    if (item.alternatives && item.alternatives.length) {
      for (const alternative of item.alternatives) {
        question.alternatives.push(Alternative.parse(alternative));
      }
    }


    return question;
  }

  public static getByCategory(ids: Array<string>, questions: Array<Question>): Array<Question> {
    const catQuestions = [];
    for (const idQuestion of ids) {
      for (const question of questions) {
        if (idQuestion === question.idQuestion) {
          catQuestions.push(question);
          break;
        }
      }
    }
    return catQuestions;
  }

  constructor() {
    this.alternatives = [];
  }
}
