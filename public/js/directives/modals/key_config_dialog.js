define(['directives', 'jquery', 'directives/modals', 'factories/keys', 'factories/modal'], function(directives, $) {
    directives.directive('keyConfigDialog', function(Modal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/modals/key_config_dialog.html',
            link: function(scope, element) {
                scope.key_config_dialog = {};

                Modal.setup_counter(element);

                element.on('show.bs.modal', scope.get_keys);

                element.on('hidden.bs.modal', function() {
                    scope.key_config_dialog = {};
                });

            },
            controller: function($scope, $element, $timeout, Keys) {
                $scope.get_keys = function() {
                    $scope.key_config_dialog.loading = true;
                    Keys.all().then(function(keys) {
                        $scope.key_config_dialog.keys = keys;
                    }).finally(function() {
                        delete $scope.key_config_dialog.loading;
                    });
                };

                $scope.add_new_key = function() {
                    $scope.key_config_dialog.new = {};
                    $timeout(function() {
                        $element.find('input:first').focus();
                    });
                };

                $scope.commit_new_key = function() {
                    $scope.key_config_dialog.loading = true;
                    Keys.new({
                        name: $scope.key_config_dialog.new.name,
                        public_key: $scope.key_config_dialog.new.public_key,
                    }).then(function(new_key) {
                        $scope.key_config_dialog.keys.splice($scope.key_config_dialog.keys.length, 0, new_key);
                    }).finally(function() {
                        delete $scope.key_config_dialog.loading;
                        delete $scope.key_config_dialog.new;
                    });
                };

                $scope.delete_key = function(id) {
                    $scope.key_config_dialog.loading = true;
                    Keys.delete(id).then(function() {
                        $scope.key_config_dialog.keys = _.reject($scope.key_config_dialog.keys, function(key) {
                            return key.id === id;
                        });
                    }).finally(function() {
                        delete $scope.key_config_dialog.loading;
                    });
                };
            }
        };
    });

    directives.directive('uniqKeyName', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('key_config_dialog.new.name', function(value) {
                    ngModel.$setValidity('uniq', !_.contains(_.map(scope.key_config_dialog.keys, function(key) { return key.name; }), value));
                });
            }
        };
    });
});
