var app = angular.module('StarterApp', ['ngMaterial', 'ngMdIcons', 'ngRoute', 'ngAnimate',
    'ui.bootstrap', 'ui.grid', 'ui.grid.selection'
]);

//Fix prefix issue
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

//configure theme
app.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .accentPalette('cyan', {
            'default': '500' //use shade 200 for default
        });
}]);

//Configure Routes
app.config(function($routeProvider) {
    $routeProvider

        //dashboard page
        .when('/dashboard', {
            templateUrl: 'pages/dashboard.html',
            controller: 'dashController'
        })

        //route for calendar page
        .when('/calendar', {
            templateUrl: 'pages/calendar.html',
            controller: 'calendarController'
        })

        //route for todo page
        .when('/todo', {
            templateUrl: 'pages/todo.html',
            controller: 'todoController'
        })

        //route for family settings page
        .when('/family', {
            templateUrl: 'pages/family.html',
            controller: 'familyController'
        })

});

//mainController
app.controller('dashController', function($scope) {
    $scope.message = 'main controller displayed';
    $scope.$parent.toolbarText = $scope.$parent.familyName + ' > ' + 'Dashboard';

});

//calendarController
app.controller('calendarController', function($scope) {
    $scope.message = 'calendar controller displayed';
    $scope.$parent.toolbarText = $scope.$parent.familyName + ' > ' + 'Calendar';

});



//todoController
app.controller('todoController', ['services', 'commonUtils', '$scope', 'uiGridConstants', '$mdDialog',
    function(services, commonUtils, $scope, uiGridConstants, $mdDialog) {
        $scope.family_id = 1;
        $scope.toolbarText = $scope.familyName + ' > ' + 'Todo Lists';
        $scope.$parent.toolbarText = $scope.$parent.familyName + ' > ' + 'Lists';

        services.getListHeads().then(function(data) {
            $scope.listHeadSum = data.data;
        });

        $scope.newList = function($event) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                controller: listHeadController,
                templateUrl: 'pages/listhead_dialog.html',
                locals: {
                    family_id: $scope.family_id,
                    listHeadSum: $scope.listHeadSum
                }
            });
        };

        function listHeadController($scope, $mdDialog, family_id, listHeadSum) {
            //assign locals
            $scope.family_id = family_id;
            $scope.listHeadSum = listHeadSum;

            //set initial times
            $scope.mstep = 15;
            var d = new Date();
            d.setHours(12);
            d.setMinutes(0);
            $scope.startTime = d;
            $scope.deadline = d;
            $scope.alarmtype_id = '';
            $scope.due_sun = 0;
            $scope.due_mon = 0;
            $scope.due_tue = 0;
            $scope.due_wed = 0;
            $scope.due_thu = 0;
            $scope.due_fri = 0;
            $scope.due_sat = 0;


            //set Alarm Types
            $scope.alarmTypes = [{
                    id: 1,
                    desc: 'Audible'
                },
                {
                    id: 2,
                    desc: 'Silent'
                },
                {
                    id: 3,
                    desc: 'Vibrate'
                }
            ];

            switch ($scope.alarmtype_id) {
                case '1':
                    $scope.selectedAlarm = {
                        id: 1,
                        desc: 'Audible'
                    };
                    break;
                case '2':
                    $scope.selectedAlarm = {
                        id: 2,
                        desc: 'Silent'
                    };
                    break;
                case '3':
                    $scope.selectedAlarm = {
                        id: 3,
                        desc: 'Vibrate'
                    };
            }

        /*    $scope.changeCheckVal = function(checkField) {
                switch (checkField) {
                    case 'sun':
                        if ($scope.due_sun == 1) {
                            $scope.due_sun = 0;
                            $scope.sunIsChecked = false;
                        } else {
                            $scope.due_sun = 1;
                            $scope.sunIsChecked = true;
                        }
                        break;
                    case 'mon':
                        if ($scope.due_mon == 1) {
                            $scope.due_mon = 0;
                            $scope.monIsChecked = false;
                        } else {
                            $scope.due_mon = 1;
                            $scope.monIsChecked = true;
                        }
                        break;
                    case 'tue':
                        if ($scope.due_tue == 1) {
                            $scope.due_tue = 0;
                            $scope.tueIsChecked = false;
                        } else {
                            $scope.due_tue = 1;
                            $scope.tueIsChecked = true;
                        }
                        break;
                    case 'wed':
                        if ($scope.due_wed == 1) {
                            $scope.due_wed = 0;
                            $scope.wedIsChecked = false;
                        } else {
                            $scope.due_wed = 1;
                            $scope.wedIsChecked = true;
                        }
                        break;
                    case 'thu':
                        if ($scope.due_thu == 1) {
                            $scope.due_thu = 0;
                            $scope.thuIsChecked = false;
                        } else {
                            $scope.due_thu = 1;
                            $scope.thuIsChecked = true;
                        }
                        break;
                    case 'fri':
                        if ($scope.due_fri == 1) {
                            $scope.due_fri = 0;
                            $scope.friIsChecked = false;
                        } else {
                            $scope.due_fri = 1;
                            $scope.friIsChecked = true;
                        }
                        break;
                    case 'sat':
                        if ($scope.due_sat == 1) {
                            $scope.due_sat = 0;
                            $scope.satIsChecked = false;
                        } else {
                            $scope.due_sat = 1;
                            $scope.satIsChecked = true;
                        }
                        break;
                }
            };*/

            $scope.saveNewList = function() {
                //setup new list values
                $scope.newListHead  = {
                    family_family_id: $scope.family_id,
                    listname: $scope.listname,
                    starttime: commonUtils.getSQLTime($scope.startTime),
                    deadline: commonUtils.getSQLTime($scope.deadline),
                    alarmtype_id: $scope.selectedAlarm.id,
                    due_sun: $scope.due_sun,
                    due_mon: $scope.due_mon,
                    due_tue: $scope.due_tue,
                    due_wed: $scope.due_wed,
                    due_thu: $scope.due_thu,
                    due_fri: $scope.due_fri,
                    due_sat: $scope.due_sat
                };

                services.insertListHead($scope.newListHead).then(function() {
                  if ($scope.listHeadSum.length < 1) {
                      $scope.listHeadSum = [];
                  }
                  $scope.listHeadSum.push($scope.newListHead);
                  $mdDialog.cancel();
              })
            };

            $scope.closeDialog = function() {
                $mdDialog.cancel();
            };
        };

        $scope.changeCheckVal = function(checkField) {
            switch (checkField) {
                case 'sun':
                    if ($scope.activeList.due_sun == 1) {
                        $scope.activeList.due_sun = 0;
                        $scope.sunIsChecked = false;
                    } else {
                        $scope.activeList.due_sun = 1;
                        $scope.sunIsChecked = true;
                    }
                    break;
                case 'mon':
                    if ($scope.activeList.due_mon == 1) {
                        $scope.activeList.due_mon = 0;
                        $scope.monIsChecked = false;
                    } else {
                        $scope.activeList.due_mon = 1;
                        $scope.monIsChecked = true;
                    }
                    break;
                case 'tue':
                    if ($scope.activeList.due_tue == 1) {
                        $scope.activeList.due_tue = 0;
                        $scope.tueIsChecked = false;
                    } else {
                        $scope.activeList.due_tue = 1;
                        $scope.tueIsChecked = true;
                    }
                    break;
                case 'wed':
                    if ($scope.activeList.due_wed == 1) {
                        $scope.activeList.due_wed = 0;
                        $scope.wedIsChecked = false;
                    } else {
                        $scope.activeList.due_wed = 1;
                        $scope.wedIsChecked = true;
                    }
                    break;
                case 'thu':
                    if ($scope.activeList.due_thu == 1) {
                        $scope.activeList.due_thu = 0;
                        $scope.thuIsChecked = false;
                    } else {
                        $scope.activeList.due_thu = 1;
                        $scope.thuIsChecked = true;
                    }
                    break;
                case 'fri':
                    if ($scope.activeList.due_fri == 1) {
                        $scope.activeList.due_fri = 0;
                        $scope.friIsChecked = false;
                    } else {
                        $scope.activeList.due_fri = 1;
                        $scope.friIsChecked = true;
                    }
                    break;
                case 'sat':
                    if ($scope.activeList.due_sat == 1) {
                        $scope.activeList.due_sat = 0;
                        $scope.satIsChecked = false;
                    } else {
                        $scope.activeList.due_sat = 1;
                        $scope.satIsChecked = true;
                    }
                    break;

            }
        };

        $scope.deleteItem = function($event) {
            services.deleteListItem($scope.activeList.listid, $scope.selectedItem);
            for (var i = 0; i < $scope.listitems.length; i++) {
                if ($scope.listitems[i].itemno == $scope.selectedItem) {
                    $scope.listitems.splice(i, 1);
                    break;
                }
            }
        }

        $scope.editItem = function($event) {
            if (!$scope.selectedItem.itemno) {
                console.log("no item selected!");
            }
            var parentEl = angular.element(document.querySelector("#item-dia-parent"));
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                controller: ItemController,
                templateUrl: 'pages/itemdialog.html',
                locals: {
                    items: $scope.listitems,
                    listid: $scope.activeList.listid,
                    itemno: $scope.selectedItem,
                    dia_type: 'edit'
                }
            })
        }

        $scope.newItem = function($event) {
            var parentEl = angular.element(document.querySelector("#item-dia-parent"));
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                controller: ItemController,
                templateUrl: 'pages/itemdialog.html',
                locals: {
                    items: $scope.listitems,
                    listid: $scope.activeList.listid,
                    itemno: '',
                    dia_type: 'new'
                }
            });
        }

        function ItemController($scope, $mdDialog, items, listid, itemno, dia_type) {
            $scope.items = items;
            $scope.listid = listid;
            $scope.dia_type = dia_type;
            $scope.itemno = itemno;
            $scope.item_desc = '';
            $scope.confirm = '';
            $scope.dist_list = '';
            $scope.notif_type_id = '';

            if ($scope.dia_type == 'edit') { //need to find selected item
                for (var i = 0; i < $scope.items.length; i++) {
                    if ($scope.items[i].itemno == $scope.itemno) {
                        $scope.item_desc = $scope.items[i].item_desc;
                        if ($scope.items[i].confirm) {
                            $scope.confirm = true;
                        } else {
                            $scope.confirm = false;
                        }

                        $scope.dist_list = $scope.items[i].dist_list;
                        $scope.notif_type_id = $scope.items[i].notif_type_id;
                        break;
                    }
                }
            }

            $scope.closeDialog = function() {
                $mdDialog.cancel();
            };

            $scope.saveNewItem = function() {
                //check dialog type for edit vs. new
                $scope.ItemToPost = {
                    list_hdr_listid: $scope.listid,
                    itemno: $scope.itemno,
                    item_desc: $scope.item_desc,
                    confirm: $scope.confirm,
                    notif_type_id: $scope.selectedNotif.id,
                    dist_list: $scope.dist_list
                };

                var valid = commonUtils.validateItem($scope.ItemToPost);
                if (valid) { //add item to list if valid
                    if ($scope.dia_type == 'new') {
                        services.insertListItem($scope.listid, $scope.ItemToPost)
                            .then(function() {
                                if ($scope.items.length < 1) {
                                    $scope.items = [];
                                }
                                $scope.items.push($scope.ItemToPost);
                            });
                    } else {
                        //update local list item
                        var index = commonUtils.getItemIndex($scope.items, $scope.itemno);

                        if (index > -1) {
                            $scope.items[index].item_desc = $scope.item_desc;
                            $scope.items[index].confirm = $scope.confirm;
                            $scope.items[index].notif_type_id = $scope.selectedNotif.id;
                            $scope.items[index].dist_list = $scope.dist_list;
                            //update db list item
                            services.updateListItem($scope.ItemToPost);
                        }

                    }
                    $mdDialog.cancel();
                };

            };

            $scope.notif_types = [{
                    id: 1,
                    desc: 'email'
                },
                {
                    id: 2,
                    desc: 'SMS'
                },
                {
                    id: 3,
                    desc: 'none'
                }
            ];

            switch ($scope.notif_type_id) {
                case '1':
                    $scope.selectedNotif = {
                        id: 1,
                        desc: 'email'
                    };
                    break;
                case '2':
                    $scope.selectedNotif = {
                        id: 2,
                        desc: 'SMS'
                    };
                    break;
                case '3':
                    $scope.selectedNotif = {
                        id: 3,
                        desc: 'none'
                    };
                    break;
            }
        }

        $scope.saveList = function(listhead) {
            services.saveListHead(listhead.listid, listhead);
        }

        $scope.updateList = function(list) {

            $scope.listPageSource = 'pages/listhead_data.html?id=' + list.listid;
            for (var i = 0; i < $scope.listHeadSum.length; i++) {
                if ($scope.listHeadSum[i].listid == list.listid) {
                    $scope.activeList = $scope.listHeadSum[i];
                    break;
                }
            }

            /* set checkboxes */
            $scope.sunIsChecked = commonUtils.setCheckbox($scope.activeList.due_sun);
            $scope.monIsChecked = commonUtils.setCheckbox($scope.activeList.due_mon);
            $scope.tueIsChecked = commonUtils.setCheckbox($scope.activeList.due_tue);
            $scope.wedIsChecked = commonUtils.setCheckbox($scope.activeList.due_wed);
            $scope.thuIsChecked = commonUtils.setCheckbox($scope.activeList.due_thu);
            $scope.friIsChecked = commonUtils.setCheckbox($scope.activeList.due_fri);
            $scope.satIsChecked = commonUtils.setCheckbox($scope.activeList.due_sat);

            $scope.startTime = commonUtils.getTextDate($scope.activeList.starttime);
            $scope.deadlineTime = commonUtils.getTextDate($scope.activeList.deadline);

            switch ($scope.activeList.alarmtype_id) {
                case '1':
                    $scope.selectedAlarm = {
                        id: 1,
                        desc: 'Audible'
                    };
                    break;
                case '2':
                    $scope.selectedAlarm = {
                        id: 2,
                        desc: 'Silent'
                    };
                    break;
                case '3':
                    $scope.selectedAlarm = {
                        id: 3,
                        desc: 'Vibrate'
                    };
            }

            $scope.gridOptions = {
                enableSorting: true,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                noUnselect: true,
                columnDefs: [{
                        name: 'ItemNo',
                        field: 'itemno',
                        width: 60
                    },
                    {
                        name: 'Item Description',
                        field: 'item_desc',
                        width: 200
                    },
                    {
                        name: 'Confirmation Required',
                        field: 'confirm',
                        width: 100
                    },
                    {
                        name: 'Notification Type',
                        field: 'notif_type_id',
                        width: 100
                    },
                    {
                        name: 'Distribution List',
                        field: 'dist_list',
                        width: 200
                    }
                ]
            };

            $scope.gridOptions.onRegisterApi = function(gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                    $scope.selectedItem = row.entity.itemno;
                });
            };

            services.getListItems($scope.activeList.listid).then(function(result) {
                $scope.listitems = result.data;
                $scope.gridOptions.data = $scope.listitems;
            });
        };

        $scope.alarmTypes = [{
                id: 1,
                desc: 'Audible'
            },
            {
                id: 2,
                desc: 'Silent'
            },
            {
                id: 3,
                desc: 'Vibrate'
            }
        ];

    }
]);

app.factory("commonUtils", [function() {
    var obj = {};

    obj.getItemIndex = function(list, itemtomatch) {
        var index = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].itemno == itemtomatch) {
                index = i;
                break;
            }
        }
        return index;
    };

    obj.getSQLTime = function(orig_date) {
        var h = orig_date.getHours();
        if (h<10) {
            h = "0" + h;
        }

        var m = orig_date.getMinutes();
        if (m<10) {
            m = "0" + m;
        }
        return h + ':' + m + ':00';
    };

    obj.getTextDate = function(dateTime) {
        var hours = dateTime.substring(0, 2);
        var mins = dateTime.substring(3, 5);
        var meridien = "AM";
        if (hours > 11) {
            meridien = "PM";
            if (hours > 12) {
                hours = hours - 12;
            }
        }
        return hours + ':' + mins + ' ' + meridien;
    };

    obj.setCheckbox = function(value) {
        if (value == 0) {
            return false;
        } else {
            return true;
        }
    };

    obj.validateItem = function(listitem) {
        if (listitem.list_hdr_listid == '') {
            return false;
        } else {
            if (listitem.itemno.length < 1) {
                return false;
            } else {
                if (listitem.item_desc.length < 1) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    };

    return obj;
}]);

app.factory("services", ['$http', function($http) {
    var serviceBase = '/webapp/services/';
    var obj = {};
    var family_id = 1;
    obj.getUsers = function() {
        return $http.get(serviceBase + 'users/' + family_id);
    };

    obj.saveUser = function(id, user) {
        return $http.post(serviceBase + 'updateUser', {
            id: id,
            user: user
        }).then(function(status) {
            console.log(status.data); //remove this after testing
            return status.data;
        });
    };

    obj.getListHeads = function() {
        return $http.get(serviceBase + 'listHeadsForFamily/' + family_id);
    };

    obj.saveListHead = function(id, listhead) {
        return $http.post(serviceBase + 'updatelist', {
            id: id,
            listhead: listhead
        }).then(function(status) {
            console.log(status.data);
            return status.data;
        });
    };

    obj.insertListHead = function(listhead) {
        return $http.post(serviceBase + 'addlisthead', listhead).then(function(status) {
            console.log(status.data);
            listhead.listid = status.data;
            return status.data;
        });
    };

    obj.insertListItem = function(id, listitem) {
        listitem.list_hdr_listid = id;
        return $http.post(serviceBase + 'addlistitem', listitem).then(function(status) {
            console.log(status.data);
            return status.data;
        });
    };

    obj.getListItems = function(listid) {
        return $http.get(serviceBase + 'listitems/' + listid);
    };

    obj.deleteListItem = function(listid, itemno) {
        return $http.delete(serviceBase + 'deletelistitem/' + listid + ',' + itemno)
            .then(function(status) {
                console.log(status.data);
                return status.data;
            });
    };

    obj.updateListItem = function(listitem) {
        return $http.post(serviceBase + 'updatelistitem', {
            id: listitem.list_hdr_listid,
            itemno: listitem.itemno,
            listitem: listitem
        }).then(function(status) {
            console.log(status.data);
            return status.data;
        });
    };

    return obj;
}]);

//familyController
app.controller('familyController', function($scope, services) {
    $scope.$parent.toolbarText = $scope.$parent.familyName + ' > ' + 'Family Settings';

    services.getUsers().then(function(data) {
        $scope.users = data.data;
    });

    $scope.updateUser = function(user) {
        $scope.userPageSource = 'pages/user_data.html?id=' + user.user_id;
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].user_id == user.user_id) {
                $scope.activeUser = $scope.users[i];
                break;
            }
        }
    };

    $scope.saveUser = function(user) {
        services.saveUser(user.user_id, user);
    }
});

app.controller('AppCtrl', ['$scope', '$mdBottomSheet', '$mdSidenav', '$mdDialog', function($scope, $mdBottomSheet, $mdSidenav, $mdDialog) {
    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    $scope.familyName = 'Sherrell Family';
    $scope.toolbarText = $scope.familyName + ' > ' + 'Dashboard';

    $scope.navigateTo = function(item, event) {
        $scope.activeItem = item;
    };

    $scope.toolbarStyle = {
        "background-color": "rgb(255,255,255)",
        "min-height": "50px",
        "color": "black",
        "padding-top": "20px",
        "padding-bottom": "0",
        "padding-left": "10px"
    }

    $scope.sidenavStyle = {
        "background-color": "rgb(0,188,212)",
    }
    $scope.menu = [{
            link: '#/dashboard',
            title: 'Dashboard',
            icon: 'home'
        },
        {
            link: '#/calendar',
            title: 'Calendar',
            icon: 'today'
        },
        {
            link: '#/todo',
            title: 'ToDo List',
            icon: 'list'
        },
        {
            link: '#/family',
            title: 'Family Settings',
            icon: 'people'
        }
    ]
}]);
