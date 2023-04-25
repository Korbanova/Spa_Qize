import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Choice {
    constructor() {
        this.quizzes = [];
        this.testResult = null;
        this.init();
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/tests');

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.quizzes = result;
            }
        } catch (e) {
            return console.log(e);
        }
        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.testResult = result;
                }
            } catch (e) {
                return console.log(e);
            }
        }

        this.processQuizzes();
    }

    processQuizzes() {
        const choiceOptionsElement = document.getElementById('choice-options');
        if (this.quizzes && this.quizzes.length > 0) {
            const that = this;
            this.quizzes.forEach(quiz => {
                const choiceOptionElement = document.createElement('div');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(this);
                }

                const choiceOptionTextElem = document.createElement('div');
                choiceOptionTextElem.className = 'choice-option-text';
                choiceOptionTextElem.innerText = quiz.name;

                const choiceOptionArrowElem = document.createElement('div');
                choiceOptionArrowElem.className = 'choice-option-arrow';

                const result = this.testResult.find(item => item.testId === quiz.id);
                if(result){
                    const choiceOptionResultElem = document.createElement('div');
                    choiceOptionResultElem.className = 'choice-option-result';
                    choiceOptionResultElem.innerHTML = `<div>Результат</div>`+
                                                       `<div>${result.score}/${result.total}</div>`;
                    choiceOptionElement.appendChild(choiceOptionResultElem);
                }

                const choiceOptionImageElem = document.createElement('img');
                choiceOptionImageElem.setAttribute('src', '/images/arrow.png');
                choiceOptionImageElem.setAttribute('alt', 'arrow');

                choiceOptionArrowElem.appendChild(choiceOptionImageElem);

                choiceOptionElement.appendChild(choiceOptionTextElem);
                choiceOptionElement.appendChild(choiceOptionArrowElem);

                choiceOptionsElement.appendChild(choiceOptionElement);
            });
        }

    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/test?id=' + dataId;
        }
    }
}

