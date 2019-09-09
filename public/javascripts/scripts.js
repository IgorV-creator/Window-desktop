var desktop_icons = [
    { id: "scheduler", value: "Ежедневник", title: "Dhtmlx Scheduler", image: "/images/scheduler.png", win: "scheduler_win" },
    { id: "gantt", value: "Менеджер задач", title: "Dhtmlx Gantt", image: "/images/gantt.png", win: "gantt_win" },
    { id: "filemanager", value: "Файловый менеджер", title: "Filemanager", image: "/images/filemanager.png", win: "filemanager_win" },
    { id: "full-screen", value: "Full screen", value1: "Exit full screen", image: "/images/fullscreen.png", image1: "/images/fullscreen-exit.png", state: 0 },
    { id: "sign-out", value: "Sign out", value1: "Login", image: "/images/signout.png", image1: "/images/home-account.png", state: 0 }
];

var tolbar_icons = [{ id: "laddFie", value: " ADD File", image: "/images/window-icon.png" }]; 
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
if (window.desktopApp)
    desktopApp.wins = {

        active: null,
        setActiveStyle: function(winId) {
            if (desktopApp.wins.active)
                webix.html.removeCss($$(desktopApp.wins.active).$view, "active_win");
            webix.html.addCss($$(winId).$view, "active_win", true);
            desktopApp.wins.active = winId;
        },
        //
        forEachWindow: function(func) {
            var views = $$("toolbar").getChildViews();
            for (var i = 1; i < views.length; i++) {
                if (views[i].config.id.indexOf("_button") != -1) {
                    var id = views[i].config.id.replace("button", "win");
                    if ($$(id))
                        func.call(this, id);
                }
            }
        },

        hideAllWindows: function() {
            this.forEachWindow(function(id) {
                if ($$(id).isVisible()) {
                    $$(id).hide();
                    webix.html.removeCss($$(id.replace("_win", "_button")).$view, "active");
                }
            });
        },

        filemanager: function() {
            var local = "/data/local";
            var win = webix.ui({
                view: "window",
                id: "Window_filemanager",
                css: "no_border",
                height: 350,
                width: 600,
                left: 50,
                top: 50,
                close: true,
                resize: true,     
                move: true,
                head: {
                    cols: [
                        { template: "Файловый менеджер", type: "header", borderless: true },
                        {
                            view: "icon",
                            icon: "mdi mdi-window-minimize",
                            tooltip: "Свернуть",
                            click: function() {
                                win.hide();
                            }
                        },
                        {
                            view: "icon",
                            icon: "mdi mdi-fullscreen",
                            tooltip: "enable fullscreen mode",
                            click: function() {
                                if (win.config.fullscreen) {
                                    webix.fullscreen.exit();
                                    this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
                                } else {
                                    webix.fullscreen.set(win);
                                    this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
                                }
                                this.refresh();
                            }
                        },
                        {
                            view: "icon",
                            icon: "wxi-close",
                            tooltip: "закрыть",
                            click: function() {
                                win.close();
                            }
                        }
                    ]
                },
                body: {
                    id: "myFiles",
                    name: "myFiles",
                    view: "filemanager",
                    autoConfig: true,
                    url: local,
                    handlers: {
                        "branch": local + "branch",
                        "upload": local,
                        "download": local,
                        "copy": local,
                        "move": local,
                        "rename": local,
                        "remove": local,
                        "create": local,
                        "search": local,
                    },

                    on: {
                        onViewInit: function(name, config) {
                            if (name == "actions") {
                                config.data[config.data.length - 1].value = "Upload File";
                                config.data.push({ id: "uploadFolder", icon: "fm-upload", value: "Upload Folder" })
                            }
                        }
                    }
                }
            });

            //Добавляем кастомный метод загрузки Folder&file
            $$("myFiles").uploadFolder = function(id, e) {
                var uploader = $$("myFiles").getUploader();
                var input = uploader.getInputNode();

                uploader.config.directory = true;
                input.setAttribute("webkitdirectory", true);
                input.setAttribute("mozdirectory", true);
                input.setAttribute("directory", true);

                webix.ui.filemanager.prototype.uploadFile.call(this, id, e);
            };
            //Добаляем  uploadFile method
            $$("myFiles").uploadFile = function(id, e) {
                var uploader = $$("myFiles").getUploader();
                var input = uploader.getInputNode();
                uploader.config.directory = true;
                input.removeAttribute("webkitdirectory");
                input.removeAttribute("mozdirectory");
                input.removeAttribute("directory");
                webix.ui.filemanager.prototype.uploadFile.call(this, id, e);
            };
            
            win.show();
        },

        scheduler: function() {
            var server = "/scheduler/server/data/";
            var win = webix.ui({
                view: "window",
                id: "Window_scheduler",
                css: "no_border",
                height: 350,
                width: 600,
                left: 50,
                top: 50,
                close: true,
                resize: true,
                move: true,
                head: {
                    cols: [
                        { template: "Ежедневник", type: "header", borderless: true },
                        {
                            view: "icon",
                            icon: "mdi mdi-window-minimize",
                            tooltip: "Свернуть",
                            click: function() {
                                win.hide();
                            }
                        },
                        {
                            view: "icon",
                            icon: "mdi mdi-fullscreen",
                            tooltip: "enable fullscreen mode",
                            click: function() {
                                if (win.config.fullscreen) {
                                    webix.fullscreen.exit();
                                    this.define({ icon: "mdi mdi-fullscreen", tooltip: "Enable fullscreen mode" });
                                } else {
                                    webix.fullscreen.set(win);
                                    this.define({ icon: "mdi mdi-fullscreen-exit", tooltip: "Disable fullscreen mode" });
                                }
                                this.refresh();
                            }
                        },
                        {
                            view: "icon",
                            icon: "wxi-close",
                            tooltip: "Close window",
                            click: function() {
                                win.close();
                            }
                        }
                    ]
                },
                body: {
                    view: "scheduler",
                    id: "scheduler",
                    mode: "month",
                    save: {
                        "insert": function(id, operation, update) {
                            if (operation == "insert")
                                return webix.ajax().post(server, update);
                        },
                        "update": function(id, operation, update) {
                            if (operation !== "insert" || operation !== "delete")
                                return webix.ajax().put(server + id, update);
                        },
                        "delete": function(id, operation, update) {
                            if (operation == "delete")
                                return webix.ajax().del(server + id);
                        }
                    },
                    url: server,
                    events: {
                        onBeforeShow: function() {
                            desktopApp.beforeWinShow("scheduler");
                        }
                    }
                }

            });
            win.show();
        },

        gantt: function() {
            var server = "/gantt/server/data";
            var win = webix.ui({
                view: "window",
                id: "Window_gantt",
                css: "no_border",
                height: 350,
                width: 600,
                left: 50,
                top: 50,
                close: true,
                resize: true,
                move: true,
                toFront: true,
                head: {
                    cols: [
                        { template: "Менеджер задач", type: "header", borderless: true },
                        {
                            view: "icon",
                            icon: "mdi mdi-window-minimize",
                            tooltip: "Свернуть",
                            click: function() {
                                win.hide();
                            }
                        }, 
                        {
                            view: "icon",
                            icon: "mdi mdi-fullscreen",
                            tooltip: "На весь экран",
                            click: function() {
                                if (win.config.fullscreen) {
                                    webix.fullscreen.exit();
                                    this.define({ icon: "mdi mdi-fullscreen", tooltip: "на весь экран" });
                                } else {
                                    webix.fullscreen.set(win);
                                    this.define({ icon: "mdi mdi-fullscreen-exit" });
                                }
                                this.refresh();
                            }
                        },
                        {
                            view: "icon",
                            icon: "wxi-close",
                            tooltip: "Закрыть",
                            click: function() {
                                win.close();
                                webix.send(" ", null, "GET");
                                // this.refresh();
                            }
                        }
                    ]
                },
                body: {
                    view: "dhx-gantt",
                    id: "gantt",
                    refresh: true,
                    },

            });
           
            gantt.refreshData();
            gantt.config.order_branch = true;
            gantt.config.order_branch_free = true;
            gantt.load(server);
           
            var dp = new gantt.dataProcessor(server);
            dp.init(gantt);
            dp.setTransactionMode("REST");
            win.show();
        }, 

        showApp: function(id) {
            if (id == "filemanager") {
                desktopApp.wins.filemanager();
            } else if (id == "scheduler") {
                desktopApp.wins.scheduler();
            } else if (id == "gantt") {
                desktopApp.wins.gantt();
            } else if (id == "sign-out") {
                if (desktopApp.loginOut) {
                    desktopApp.loginOut();
                    desktopApp.wins.LoginIn();
                    desktopApp.signOut();
 
                }

            } else if (id == "full-screen") {
                var item = this.getItem(id);
                if (desktopApp.fullScreen(!item.state)) {
                    item.state = item.state ? 0 : 1;
                    this.refresh(id);
                }
            } 
        }
    };

    desktopApp.init();
