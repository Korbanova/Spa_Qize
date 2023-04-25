export class UrlManager {
    static getQueryParams() {
        const qs = document.location.hash.split('+').join(' ');
        let params = {},
            token,
            re = /[?&]([^=]+)=([^&]*)/g;

        while (token = re.exec(qs)) {
            params[decodeURIComponent(token[1])] = decodeURIComponent(token[2]);
        }
        return params;
    }

    static checkUserData() {
        const name = sessionStorage.getItem('name');
        const lastName = sessionStorage.getItem('lastName');
        const email = sessionStorage.getItem('email');

        //если какого параметра нет, переводим на 1-ную страницу
        if (!name || !lastName || !email) {
            location.href = '#/';
        }
    }
}