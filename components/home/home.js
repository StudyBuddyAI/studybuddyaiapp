(function() {
    'use strict';
    angular.module('studybuddyai.app.home', [])
        .run(function(bsLoadingOverlayService) {
            bsLoadingOverlayService.setGlobalConfig({
                templateUrl: 'components/common/loading-overlay-template.html'
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            var now = new Date();
            var ticks = now.getTime();

            // Home
            $stateProvider.state('home', {
                url: '/',
                templateUrl: 'components/home/home.html?'+ticks,
                controller: 'HomeController',
                controllerAs: 'homeCtrl'
            });


            $urlRouterProvider.otherwise('/');

        })
        .service('DataService',function ($http, $q, $timeout,AppConfig) {
            var self = this;

            var now = function () { return new Date(); };
            var ticks = now().getTime();
            var cache = {}

            // LoadTitleMatrix
            self.LoadTitleMatrix = function (id) {
                return $http.get(AppConfig.Settings.mongodb_service_url + '/load_title_matrix?id=' + id  + "&" + now().getTime(), { cache: false });
            }
            self.LoadAllTitleMatrix = function () {
                return $http.get(AppConfig.Settings.mongodb_service_url + '/load_all_title_matrix?' + now().getTime(), { cache: false });
            }
            self.GetContextMemory = function () {
                return $http.get(AppConfig.Settings.mongodb_service_url + '/get_context_memory?' + now().getTime(), { cache: false });
            }

            // Submit your own
            self.SubmitYourOwn = function (obj) {
                return $http.post(AppConfig.Settings.mongodb_service_url + '/submit_your_own', obj);
            }
            self.SubmitQuestionForTitle = function (id,obj,enable_context_memory) {
                return $http.post(AppConfig.Settings.mongodb_service_url + '/submit_question_for_title?id=' + id + '&enable='+enable_context_memory, obj);
            }
            self.SubmitQuestionForAllTitles = function (obj,enable_context_memory) {
                return $http.post(AppConfig.Settings.mongodb_service_url + '/submit_question_for_all_titles?enable='+enable_context_memory, obj);
            }

            // Title
            self.GetAllTitles = function () {
                var q = {};
                return $http.get(AppConfig.Settings.mongodb_service_url + '/titles?' + "q=" + JSON.stringify(q) + "&" + now().getTime(), { cache: false });
            }
            self.GetCustomeTitles = function () {
                var q = {custom:true};
                return $http.get(AppConfig.Settings.mongodb_service_url + '/titles?' + "q=" + JSON.stringify(q) + "&" + now().getTime(), { cache: false });
            }
            self.GetTitle = function (id) {
                return $http.get(AppConfig.Settings.mongodb_service_url + '/titles/' + id + "?" + now().getTime(), { cache: false });
            }
            self.AddTitle = function(obj){
                return $http.post(AppConfig.Settings.mongodb_service_url + '/titles', obj);
            }
            self.UpdateTitle = function(_id,updateFields){
                return $http.post(AppConfig.Settings.mongodb_service_url + '/titles/'+_id, updateFields);
            }
            self.DeleteTitle = function(_id){

            }

            // Paragraphs
            self.GetParagraphsForTitle = function (title_id) {
                var q = {title_id:title_id};
                return $http.get(AppConfig.Settings.mongodb_service_url + '/paragraphs?' + "q=" + JSON.stringify(q) + "&" + now().getTime(), { cache: false });
            }
            self.GetParagraph = function (id) {
                return $http.get(AppConfig.Settings.mongodb_service_url + '/paragraphs/' + id + "?" + now().getTime(), { cache: false });
            }
            self.AddParagraph = function(obj){
                return $http.post(AppConfig.Settings.mongodb_service_url + '/paragraphs', obj);
            }
            self.UpdateParagraph = function(_id,updateFields){
                return $http.post(AppConfig.Settings.mongodb_service_url + '/paragraphs/'+_id, updateFields);
            }
            self.DeleteParagraph = function(_id){

            }

            // Settings
            self.GetSettings = function(){
                var q = {};
                return $http.get(AppConfig.Settings.mongodb_service_url + '/settings?' + "q=" + JSON.stringify(q) + "&" + now().getTime(), { cache: false });
            }
            self.AddSetting = function(obj){
                return $http.post(AppConfig.Settings.mongodb_service_url + '/settings', obj);
            }
            self.UpdateSetting = function(_id,updateFields){
                return $http.post(AppConfig.Settings.mongodb_service_url + '/settings/'+_id, updateFields);
            }

            // Trained Models
            self.GetTrainedModels = function(){
                return $http.get(AppConfig.Settings.mongodb_service_url + '/trained_model_list?' + now().getTime(), { cache: false });
            }
            self.LoadTrainedModel = function(path){
                return $http.get(AppConfig.Settings.mongodb_service_url + '/load_trained_model?path=' + path + '&' + now().getTime(), { cache: false });
            }

        })
        .controller('HomeController',function (DataService,toaster,$state) {
            var self = this;

            self.addTopic = false;


            DataService.GetCustomeTitles()
                .then(function(response){
                    self.all_titles = response.data.titles;
                })
                .catch(function(response){
                    console.dir(response);
                    toaster.pop('error', "Error", "There was an error processing your request");
                });

            self.GetTitle = function (title) {
                return title.replace(/_/g, " ");
            }
            self.GotoTitle = function (row) {
                $state.go('titleqa',{id:row._id.$oid});
            }
            self.EnterCustom = function () {
                $state.go('enteryourown');
            }

            self.Save = function () {

                var update_obj = {};
                update_obj['title'] = self.new_topic;
                update_obj['custom'] = true;

                DataService.AddTitle(update_obj)
                    .then(function(response){
                        console.dir(response.data);
                        update_obj['_id'] = response.data;

                        self.all_titles.push(update_obj);
                        self.addTopic = false;
                    })
                    .catch(function(response){
                        console.dir(response);
                        toaster.pop('error', "Error", "There was an error processing your request");
                    });

            }
            self.Cancel = function () {
                self.addTopic = false;
            }
        })
})();