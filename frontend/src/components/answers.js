import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config.js";

export class Answers {
    constructor() {
        this.quiz = null;
        this.questionsElement = null;
        this.questionsElement = document.getElementById('questions');
        this.routeParams = UrlManager.getQueryParams();

        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result.test;
                    this.showQuestions()

                    const that = this;
                    document.getElementById('answers-pre-title').innerText = result.test.name;
                    document.getElementById('answers-user').innerHTML = 'Тест выполнил(a) <span>'
                        + ' ' + userInfo.fullName + ', ' + localStorage.getItem('email') + '</span>';
                    document.getElementById('show-results').onclick = function () {
                        location.href = '#/result?id=' + that.routeParams.id;
                    }
                } else {
                    location.href = '#/';
                }
            } catch (e) {
                return console.log(e);
            }
        }
    }

    showQuestions() {
        this.questionsElement.innerHTML = '';
        this.quiz.questions.forEach((question, index) => {
            const questionElem = `<div class="answers-question">
                                          <div class="common-question-title" id="title${question.id}">
                                            <span>Вопрос ${index + 1}: </span>${question.question}
                                          </div>
                                          <div class="answers-question-options" id="options${question.id}">
                                                ${this.createAnswer(question, index)}
                                          </div>
                                      </div>`;
            this.questionsElement.innerHTML += questionElem;
        })
    }

    createAnswer(question, index) {
        return question.answers.map(answer => {
            let attrInput = '';
            let attrLabel = '';
            if (answer.hasOwnProperty('correct')) {
                attrInput = 'checked="checked"';

                let color = (answer.correct) ? '#5FDC33' : '#DC3333';

                attrInput += 'style="border-color:' + color + '";';
                attrLabel = 'style="color:' + color + '";';
            }
            const inputId = 'answer-' + answer.id;
            const option = `<div class="common-question-option">
                                    <input class="option-answer" id="${inputId}" type="radio" name="answer${question.id}" value="${answer.id}" disabled="disabled" ${attrInput}>
                                    <label for="${inputId}" ${attrLabel}>${answer.answer}</label>
                                </div>`;
            return option;
        }).join('');
    }
}