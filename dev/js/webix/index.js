desktopApp = {
    buttonCount: 1,
    init: function() {
        this.createLayout();
        this.createToolbar();
        this.createMenu();

        webix.attachEvent("onFocusChange", function(view) {
            if (view) {
                var win = view.getTopParentView();
                if (win.getParentView())
                    win = win.getParentView().getTopParentView();
                var id = win.config.id;
                if (id.indexOf("_win") != -1) {
                    desktopApp.setActiveWindow(id);
                }
            }
        });
    },

    signIn: function() {
        webix.$$('main').show();
        webix.$$('toolbar').show();
    },
    signOut: function() {
        desktopApp.wins.hideAllWindows();
        webix.$$("toolbar").hide();
        webix.$$("desktop").hide();
        webix.$$("winmenu-options-list").hide();

        webix.$$("sign-in").show();
    },
    loginOut: (() => {
        webix.send("/logout", null, "GET");
    }),

    createLayout: function() {
        webix.ui({
            view: "window",
            css: "desktop-window",
            move: true,
            body: {
                view: "list",
                id: "desktop",
                width: 105,
                css: "desktop-items",

                type: {

                    height: 130,
                    template: "<div class='desktop-item-inner'><img src='#image#'><div class='desktop-icons'> #title#</div></div>",
                    css: "desktop-item"
                },
                select: "multiselect",
                drag: true,
                data: webix.copy(desktop_icons),
                on: {
                    onItemDblClick: desktopApp.wins.showApp
                }
            }
        }).show();
    },

    createToolbar: function() {
        var date = new Date();
        var options = { hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' };

        webix.ui({
            view: "toolbar",
            id: "toolbar",
            paddingY: 2,
            height: 40,
            css: "toolbar-bottom",
            cols: [{
                    view: "button",
                    id: "start_button",
                    css: "webix_transparent",
                    type: "image",
                    image: "/images/start.png",
                    width: 72,
                    height: 35,

                    on: {
                        onItemClick: function() {
                            if ($$("winmenu").config.hidden === false) {
                                $$("winmenu").hide();
                            } else {
                                $$("winmenu").show();
                            }
                        }
                    }
                },
                {},
                {
                    view: "template",
                    id: "time",
                    width: 110,
                    css: "time_template",
                    template: "#time#",
                    data: [{
                        time: new Intl.DateTimeFormat('en-US', options).format(date).replace(/\//g, '.').replace(',', '')
                    }]
                }
            ]
        })
    },
    fullScreen: function(mode) {
        var el = mode ? document.documentElement : document,
            rfs;
        if (mode) {
            rfs = (
                el.requestFullScreen ||
                el.webkitRequestFullScreen ||
                el.mozRequestFullScreen ||
                el.msRequestFullScreen ||
                el.msRequestFullscreen
            );
        } else {
            rfs = (
                el.cancelFullScreen ||
                el.webkitExitFullscreen ||
                el.mozCancelFullScreen ||
                el.msExitFullscreen
            );
        }

        if (rfs) {
            rfs.call(el);
            return true;
        }
        return false;
    },

    createMenu: function() {
        webix.ui({
            view: "popup",
            id: "winmenu",
            // hidden: true,
            css: "winmenu_css",
            body: {
                view: "layout",
                id: "lay",
                css: "winmenu_body",

                cols: [{
                    view: "layout",
                    id: "lay_two",
                    css: "winmenu_body_cols",
                    rows: [{
                            id: "login",
                            view: "template",
                            css: "start_menu_list",
                            height: 60,
                            template: 'http->/login',
                        },
                        {
                            id: "winmenu-options-list",
                            view: "list",
                            css: "start_menu_list",
                            //css: "winmenu_body_1",
                            height: 350,
                            template: function(obj) {
                                var icon = "image",
                                    value = "value";
                                if (obj.state) {
                                    icon += obj.state;
                                    value += obj.state;
                                }
                                return "<div id='menu_sys_icon'><img src=' " + obj[icon] + " '> </div>" + obj[value];
                            },
                            type: {
                                height: 70
                            },
                            select: true,
                            data: desktop_icons,
                            on: {
                                onItemClick: desktopApp.wins.showApp

                            }

                        }
                    ]
                }]
            }
        })
    }
};