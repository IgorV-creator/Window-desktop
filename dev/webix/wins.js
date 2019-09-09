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
