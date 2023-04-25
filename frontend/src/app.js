import {Router} from "./router.js";

class App {
    constructor() {
        this.router = new Router();
        //когда контент загрузился
        //используем ту функцию, кот-я должна определить какую страницу мы загрузили или где сейчас находимся
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        //обрабатываем событие когда меняется урл на странице
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));
    }

    handleRouteChanging(){
        this.router.openRoute();
    }
}

(new App());