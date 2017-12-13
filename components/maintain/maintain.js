(function() {
    'use strict';
    angular.module('studybuddyai.app.maintain', [])
        .config(function ($stateProvider, $urlRouterProvider) {
            var now = new Date();
            var ticks = now.getTime();

            // Maitain
            $stateProvider.state('settings', {
                url: '/settings',
                templateUrl: 'components/maintain/settings.html?'+ticks,
                controller: 'SettingsController',
                controllerAs: 'settingsCtrl'
            });

        })
        .controller('SettingsController',function (DataService,toaster,$state) {
            var self = this;


            DataService.GetSettings()
                .then(function(response){
                    self.settings = response.data.settings[0];
                    console.log(self.settings);
                    if(!self.settings){
                        self.settings = {}
                    }

                    return DataService.GetTrainedModels();
                })
                .then(function(response){
                    self.trained_model_list = response.data;

                    console.log(self.trained_model_list);
                })
                .catch(function(response){
                    console.dir(response);
                    toaster.pop('error', "Error", "There was an error processing your request");
                });


            self.Back = function(){
                $state.go('home');
            }
            
            self.Save = function () {

                var update_obj = {};
                update_obj['model'] = self.settings.model;

                if(self.settings._id == '' || !self.settings._id){
                    // Insert
                    DataService.AddSetting(update_obj)
                        .then(function(response){
                            console.dir(response.data);
                            self.settings['_id'] = response.data;

                            return DataService.LoadTrainedModel(self.settings.model);
                        })
                        .then(function(response){
                            console.dir(response.data);
                            self.Back();
                        })
                        .catch(function(response){
                            console.dir(response);
                            toaster.pop('error', "Error", "There was an error processing your request");
                        });
                }else{
                    // Update
                    DataService.UpdateSetting(self.settings._id.$oid,update_obj)
                        .then(function(response){
                            console.dir(response.data);

                            return DataService.LoadTrainedModel(self.settings.model);
                        })
                        .then(function(response){
                            console.dir(response.data);
                            self.Back();
                        })
                        .catch(function(response){
                            console.dir(response);
                            toaster.pop('error', "Error", "There was an error processing your request");
                        });
                }
            }

        })
})();