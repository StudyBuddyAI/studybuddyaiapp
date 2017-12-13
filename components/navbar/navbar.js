(function() {
    'use strict';
    angular.module('studybuddyai.app.navbar', [])
        .directive('appHeader', function () {
            var now = new Date();
            var ticks = now.getTime();

            // <app-navbar></app-navbar>
            return {
                restrict: 'E',
                templateUrl: 'components/navbar/header.html?'+ticks
            };
        })
        .directive('appFooter', function () {
            var now = new Date();
            var ticks = now.getTime();

            // <app-footer></app-footer>
            return {
                restrict: 'E',
                templateUrl: 'components/navbar/footer.html?'+ticks
            };
        })
        .controller('HeaderController', function () {
            var self = this;

        })

})();
