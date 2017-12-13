(function() {
    'use strict';
    angular.module('studybuddyai.app', [
        'ui.router'
        ,'ui.bootstrap'
        ,'ngSanitize'
        ,'LocalStorageModule'
        ,'toaster'
        ,'bsLoadingOverlay'
        ,'ui'
        ,'ui.grid'
        ,'ui.grid.pinning'
        ,'ui.grid.exporter'
        ,'ui.grid.resizeColumns'
        ,'ui.grid.edit'
        ,'ui.select'
        ,'ui.utils.masks'
        ,'studybuddyai.app.config'
        ,'studybuddyai.app.common'
        ,'studybuddyai.app.navbar'
        ,'studybuddyai.app.menu'
        ,'studybuddyai.app.home'
        ,'studybuddyai.app.qa'
        ,'studybuddyai.app.maintain'
    ])
        .service('AppService',function($window){
            var self = this;

            self.CurrentUser = {};

            self.GetScreenWidth = function () {
                return $window.innerWidth;
            }
            self.IsMobile = function(){
                if($window.innerWidth < 700){
                    return true;
                }else{
                    return false;
                }
            }

            self.guid = function() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
        })
        .controller('appController', function ($state,AppService) {
            var self = this;
            console.log("appController");

        })

})();

