var element_log = [{
    view: "text",
    label: 'Username',
    name: "login",
    id: "login-login",
    required: true,
    validate: webix.rules.isNotEmpty,
    invalidMessage: "Логин не может быть пустым",
}, {
    view: "text",
    type: "password",
    id: "password-login",
    label: "Password",
    name: "password",
    required: true,
    validate: webix.rules.isNotEmpty,
    invalidMessage: "Пожалуйста, введите пароль!",

}, {
    view: "button",
    label: "Отправить",
    type: "form",
    id: "loginFormSubmit",
    width: 150,
    align: "center",
    click: function() {
        var form = this.getParentView();
        if (form.validate()) {
            webix.alert("Добро пожаловать!");
            webix.send("/user", $$("loginForm").getValues(), "POST");


        }

    }
}];

var element_reg = [{
        view: "text",
        label: 'Username',
        name: "username",
        id: "register_login",
        invalidMessage: "Логин не может быть пустым",

    },
    {
        view: "text",
        label: "Email",
        id: "register_email",
        name: "email",
        //  required: true,
        invalidMessage: "Пожалуйста, введите действительный адрес электронной почты!",

    },
    {
        view: "text",
        type: "password",
        label: "Password",
        id: "register_password",
        name: "register_password",
        invalidMessage: "Пожалуйста, введите пароль!",

    },
    {
        view: "text",
        type: "password",
        label: "password_confirm",
        id: "register_password_confirm",
        name: "passwordConfirm",
        invalidMessage: "Пароли не совпадают",

    },
    {
        view: "checkbox",
        labelRight: 'Я принимаю условия ',
        name: "accept",
        id: "accept",
        invalidMessage: "Необходимо принять условия"

    },
    {
        view: "button",
        label: "Отправить",
        type: "form",
        id: "regFormSubmit",
        width: 150,
        align: "center",
        click: function() {
            var form = this.getParentView();
            if (form.validate()) {
                webix.alert("Отлично!");
                webix.send("/register", $$("regForm").getValues(), "POST");
            }

        }
    }
]

var form = [{
        view: "form",
        header: "Авторизация",
        id: "loginForm",
        name: "loginForm",
        elements: element_log,
        rules: {
            "login": webix.rules.isNotEmpty,
            "password": webix.rules.isNotEmpty,

        }
    },
    {
        view: "form",
        header: "Регистрация",
        id: "regForm",
        name: "regForm",
        elements: element_reg,
        rules: {
            "email": webix.rules.isEmail,
            "username": webix.rules.isNotEmpty,
            "register_password": webix.rules.isNotEmpty,
            "accept": webix.rules.isChecked,
            $obj: (data) => {
                if (data.register_password != data.passwordConfirm) {
                    webix.message("пароли не совпадают");
                    return false;
                }
                return true;
            }
        }
    }
];

var win = webix.ui({
    //container: "body",
    view: "tabview",
    width: 400,
    height: 500,
    css: "LoginIn_style",
    id: "loginIn",
    cells: form
});