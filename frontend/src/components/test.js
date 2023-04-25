import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Test {
    constructor() {
        this.arrowElement = null;
        this.progressBarElement = null;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passButtonElement = null;
        this.userResult = [];
        this.routeParams = UrlManager.getQueryParams();

        this.init();

    }

    async init() {
        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result;
                    this.startQuiz();
                }
            } catch (e) {
                return console.log(e)
            }
        }
    }

    startQuiz() {
        this.arrowElement = document.getElementById('arrow');
        this.progressBarElement = document.getElementById('progress-bar');
        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.onclick = this.move.bind(this, 'next');
        this.passButtonElement = document.getElementById('pass');
        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');
        document.getElementById('pre-title').innerText = this.quiz.name;

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement = document.getElementById('timer');
        let seconds = 59;
        this.interval = setInterval(function () {
            seconds--;
            timerElement.innerText = seconds;
            if (seconds === 0) {
                clearInterval(this.interval);
                this.complete();
            }
        }.bind(this), 1000);
    }

    prepareProgressBar() {
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement = document.createElement('div');
            itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

            const itemCircleElement = document.createElement('div');
            itemCircleElement.className = 'test-progress-bar-item-circle';

            const itemTextElement = document.createElement('div');
            itemTextElement.className = 'test-progress-bar-item-text';
            itemTextElement.innerText = 'Вопрос' + (i + 1);

            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            this.progressBarElement.appendChild(itemElement);
        }
    }

    showQuestion() {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex
            + ': </span>' + activeQuestion.question + '?';

        this.optionsElement.innerHTML = '';
        const that = this;

        //Поиск ответа на вопрос, на котором мы сейчас находимся
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);

        activeQuestion.answers.forEach(answer => {
            const optionElement = document.createElement('div');
            optionElement.className = 'test-question-option';

            //<input type="radio" id="answer-one" name="answer">
            const inputId = 'answer-' + answer.id;
            const inputElement = document.createElement('input');
            inputElement.className = 'option-answer';
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'answer');
            inputElement.setAttribute('value', answer.id);

            inputElement.onchange = function () {
                that.chooseAnswer();
            }
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked');
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            //
            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);
            this.optionsElement.appendChild(optionElement);
        });
        // если ответ не выбран блокируем кнопку далее
        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
            this.disabledLink();
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled');
            this.activeLink();
        }


        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = 'Завершить';
        } else {
            this.nextButtonElement.innerText = 'Далее';
        }
        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }

    }

    disabledLink() {
        this.passButtonElement.onclick = function (e) {
            e.preventDefault();
        }
        this.passButtonElement.classList.add('disabled-link');
        this.arrowElement.setAttribute('src', '/images/small-arrow-light.png');
    }

    activeLink() {
        this.passButtonElement.onclick = this.move.bind(this, 'pass');
        this.passButtonElement.classList.remove('disabled-link');
        this.arrowElement.setAttribute('src', '/images/small-arrow.png');
    }

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.disabledLink();

    }

    move(action) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
            return element.checked;
        });
        let chosenAnswerId = null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }
        // Поиск ответа в списке
        const existingResult = this.userResult.find(item => {
            return item.questionId === activeQuestion.id;
        })
        // если нашли - перезаписываем, иначе - добавляем в список
        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId;
        } else {
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId

            });
        }

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            //clearInterval(interval);
            clearInterval(this.interval);
            this.complete();
            return;
        }

        Array.from(this.progressBarElement.children).forEach((item, index) => {
            const currentItemIndex = index + 1;
            item.classList.remove('complete');
            item.classList.remove('active');

            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else if (currentItemIndex < this.currentQuestionIndex) {
                item.classList.add('complete');
            }
        });


        this.showQuestion();
    }

    async complete() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/pass', 'POST',
                {
                    userId: userInfo.userId,
                    results: this.userResult
                });

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = '#/result?id=' + this.routeParams.id;
            }
        } catch (e) {
            console.log(e);
        }


    }
}
