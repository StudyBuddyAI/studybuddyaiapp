(function() {
    'use strict';
    angular.module('studybuddyai.app.qa', [])
        .config(function ($stateProvider, $urlRouterProvider) {
            var now = new Date();
            var ticks = now.getTime();

            // QA
            $stateProvider.state('titleqa', {
                url: '/titleqa/{id}',
                templateUrl: 'components/qa/titleqa.html?'+ticks,
                controller: 'TitleQAController',
                controllerAs: 'titleQACtrl'
            });
            $stateProvider.state('edittitlecontext', {
                url: '/edittitlecontext/{id}',
                templateUrl: 'components/qa/edittitlecontext.html?'+ticks,
                controller: 'EditTitleContextController',
                controllerAs: 'editTitleContextCtrl'
            });
            $stateProvider.state('askanything', {
                url: '/askanything',
                templateUrl: 'components/qa/askanything.html?'+ticks,
                controller: 'AskAnythingController',
                controllerAs: 'askAnythingCtrl'
            });
            $stateProvider.state('enteryourown', {
                url: '/enteryourown',
                templateUrl: 'components/qa/enteryourown.html?'+ticks,
                controller: 'EnterYourOwnController',
                controllerAs: 'enterYourOwnCtrl'
            });

        })
        .controller('TitleQAController',function (DataService,toaster,$state, $stateParams) {
            var self = this;

            self.id = $stateParams.id;
            console.log(self.id);
            self.context_question = '';
            self.display_context = '';

            if (self.id == '') {
                $state.go('home');
            }

            self.Back = function(){
                $state.go('home');
            }
            self.EditContexts = function () {
                $state.go('edittitlecontext',{id:self.id});
            }
            self.GetTitleText = function (title) {
                if(title) return title.replace(/_/g, " ");
            }

            // Initialize Title Matrix on the server
            DataService.LoadTitleMatrix(self.id)
                .then(function(response){
                    console.log(response.data);
                })
                .catch(function(response){
                    console.dir(response);
                    toaster.pop('error', "Error", "There was an error processing your request");
                });

            DataService.GetTitle(self.id)
                .then(function(response){
                    self.title = response.data;
                    console.log(self.title);
                })
                .catch(function(response){
                    console.dir(response);
                    toaster.pop('error', "Error", "There was an error processing your request");
                });

            self.SubmitQuestion = function () {
                console.log(self.context_question)

                var submit = {};
                submit['question'] = self.context_question;

                DataService.SubmitQuestionForTitle(self.id,submit)
                    .then(function(response){
                        console.dir(response.data);
                        self.results = response.data.prediction;
                        self.context_text = response.data.passage;

                        if(self.results.best_span_str == '') {
                            self.display_context = self.context_text;
                        }else{
                            self.display_context = self.context_text.replace(self.results.best_span_str,'<span class="highlighted-text">' + self.results.best_span_str + '</span>');
                        }

                    })
                    .catch(function(response){
                        console.dir(response);
                        toaster.pop('error', "Error", "There was an error processing your request");
                    });
            }

        })
        .controller('EditTitleContextController',function (DataService,AppService,toaster,$state, $stateParams) {
            var self = this;

            self.id = $stateParams.id;
            console.log(self.id);
            //self.project = {};

            self.display_context = [];

            if (self.id == '') {
                $state.go('home');
            }

            self.Back = function(){
                $state.go('titleqa',{id:self.id});
            }

            self.GetTitleText = function (title) {
                if(title) return title.replace(/_/g, " ");
            }

            DataService.GetTitle(self.id)
                .then(function(response){
                    self.title = response.data;
                    console.log(self.title);

                    return DataService.GetParagraphsForTitle(self.id);
                })
                .then(function(response){
                    self.paragraphs = response.data.paragraphs;

                    // Fill the contexts
                    _.forEach(self.paragraphs, function(p) {
                        self.display_context[p._id.$oid] = p.context;
                    });
                    console.log(self.paragraphs);
                })
                .catch(function(response){
                    console.dir(response);
                    toaster.pop('error', "Error", "There was an error processing your request");
                });



            self.DisplayContext = function(id,context,answer){
                if(!answer) {
                    self.display_context[id] = context;
                }else{
                    self.display_context[id] = context.replace(answer,'<span class="highlighted-text">' + answer + '</span>');
                }
                // self.display_context[id] = context.replace(new RegExp(answer, "gi"), function(match) {
                //     return '<span class="highlighted-text">' + match + '</span>';
                // });
            }
            self.ResetContext = function (id,context) {
                self.display_context[id] = context;
            }
            self.AddContext = function () {
                var p = {}
                p['context'] = self.new_context;
                p['title_id'] = self.id;
                p['qas'] = [];

                self.paragraphs.push(p);
                self.new_context = '';

                self.Save();

            }
            self.AddQuestion = function (p) {
                if(self.new_question[p._id.$oid] == ''){
                    return;
                }
                console.log(self.new_question[p._id.$oid]);

                var newQuestion = {}
                newQuestion['answers'] = [];
                newQuestion['question'] = self.new_question[p._id.$oid];
                newQuestion['id'] = AppService.guid();
                p.qas.push(newQuestion);

                self.new_question[p._id.$oid] = '';
            }
            self.AddAnswer = function (p,qa) {
                if(self.new_answer[qa.$$hashKey] == ''){
                    return;
                }


                var newAnswer = {}
                newAnswer['text'] = self.new_answer[qa.$$hashKey];
                newAnswer['answer_start'] = p.context.indexOf(newAnswer['text']);
                qa.answers.push(newAnswer);
                console.log(newAnswer);

                self.new_answer[qa.$$hashKey] = '';
            }
            
            self.Save = function () {
                // Save all paragraphs
                _.forEach(self.paragraphs, function(p) {

                    var update_obj = {};
                    update_obj['context'] = p['context'];
                    update_obj['title_id'] = self.id;
                    update_obj['qas'] = p['qas'];

                    if(p._id == '' || !p._id){
                        // Insert
                        console.log('Inserting...')
                        DataService.AddParagraph(update_obj)
                            .then(function(response){
                                console.dir(response.data);
                                p['_id'] = response.data;
                                self.display_context[p._id.$oid] = p['context'];
                            })
                            .catch(function(response){
                                console.dir(response);
                                toaster.pop('error', "Error", "There was an error processing your request");
                            });
                    }else{
                        // Update
                        DataService.UpdateParagraph(p._id.$oid,update_obj)
                            .then(function(response){
                                console.dir(response.data);

                            })
                            .catch(function(response){
                                console.dir(response);
                                toaster.pop('error', "Error", "There was an error processing your request");
                            });
                    }

                });
            }

        })
        .controller('AskAnythingController',function (DataService,toaster,$state) {
            var self = this;

            self.context_text = '';
            self.context_question = '';
            self.display_context = '';

            self.Back = function(){
                $state.go('home');
            }

            // Initialize Title Matrix on the server
            DataService.LoadAllTitleMatrix()
                .then(function(response){
                    console.log(response.data);
                })
                .catch(function(response){
                    console.dir(response);
                    toaster.pop('error', "Error", "There was an error processing your request");
                });

            self.SubmitQuestion = function () {
                console.log(self.context_question)

                var submit = {};
                submit['question'] = self.context_question;

                DataService.SubmitQuestionForAllTitles(submit)
                    .then(function(response){
                        console.dir(response.data);
                        self.results = response.data.prediction;
                        self.context_text = response.data.passage;

                        if(self.results.best_span_str == '') {
                            self.display_context = self.context_text;
                        }else{
                            self.display_context = self.context_text.replace(self.results.best_span_str,'<span class="highlighted-text">' + self.results.best_span_str + '</span>');
                        }

                    })
                    .catch(function(response){
                        console.dir(response);
                        toaster.pop('error', "Error", "There was an error processing your request");
                    });
            }

        })
        .controller('EnterYourOwnController',function (DataService,toaster,$state) {
            var self = this;

            self.context_text = '';
            self.context_question = '';
            self.display_context = '';

            self.examples = [
                {
                    'name':'Example 1'
                    ,'text':'Tom Brady sat on the bench, hunched over a tablet he held inches from his face. He looked like a man searching for answers. Fifty-seven seconds remained in the New England Patriots\' stunning 27-20 Monday night loss to the Miami Dolphins. As Brady swiped through images of everything that had gone wrong, one question quickly emerged: Just how could the Patriots, just a week before the biggest game of their season, play this poorly? “I didn’t see it as a trap game,” veteran safety Devin McCourty said afterward. “We knew — we’ve got a championship on the line — that’s not a trap game. We didn’t execute as well as we needed to against another team that’s fighting for their playoff berth, too. So it’s just that point in the season where if you don’t play at your highest level, you’ll lose.”'
                }
            ]

            self.Back = function(){
                $state.go('home');
            }
            self.LoadExample = function (eg) {
                self.context_text = eg.text;
            }
            
            self.SubmitQuestion = function () {

                var submit = {};
                submit['passage'] = self.context_text;
                submit['question'] = self.context_question;

                DataService.SubmitYourOwn(submit)
                    .then(function(response){
                        console.dir(response.data);
                        self.results = response.data;

                        if(self.results.best_span_str == '') {
                            self.display_context = self.context_text;
                        }else{
                            self.display_context = self.context_text.replace(self.results.best_span_str,'<span class="highlighted-text">' + self.results.best_span_str + '</span>');
                        }

                    })
                    .catch(function(response){
                        console.dir(response);
                        toaster.pop('error', "Error", "There was an error processing your request");
                    });
            }

        })
})();