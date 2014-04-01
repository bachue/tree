define(['controllers', 'factories/projects', 'factories/keys', 'factories/sections', 'factories/loading_indicator', 'factories/screen_mode'], function(controllers) {
    return controllers.controller('Application', function($scope, $state, $location, $timeout, Projects, Keys, Sections, LoadingIndicator, ScreenMode, projects) {
        $scope.current = {};

        if (window.localStorage) ScreenMode.set(localStorage['screen_mode']);
        if (ScreenMode.is_undefined()) ScreenMode.switch_to_default_mode();

        $scope.loading = LoadingIndicator.loading;

        $scope.set_current_project = function(name) {
            if ($scope.current.project && $scope.current.project.name === name)
                return;
            Sections.clear();
            delete $scope.current.tag_name;
            delete $scope.current.document;
            delete $scope.current.document_path;
            // We don't specify tag_name in this project, so it'll be set to default value 'HEAD'
            $state.go('application.project', {project_name: name, tag_name: 'HEAD', document_path: null});
        };

        $scope.set_current_tag = function(tag_name) {
            if ($scope.current.tag === tag_name) return;
            Sections.clear();
            $state.go('application.project.tag.doc', {tag_name: tag_name});
        };

        $scope.has_sections = Sections.exists;
        $scope.current_sections = Sections.get;

        $scope.select_tree = function(path) {
            if (path) $scope.$broadcast('toSelectBranches', path);
        };

        $scope.current_screen_mode = ScreenMode.get;
        $scope.is_full_mode = ScreenMode.is_full_mode;

        $scope.set_full_mode = function() {
            $timeout(function() {
                ScreenMode.switch_to_full_mode();
                if (window.localStorage) localStorage['screen_mode'] = ScreenMode.get();
            });
        };

        $scope.set_split_mode = function() {
            $timeout(function() {
                ScreenMode.switch_to_sidebar_mode();
                if (window.localStorage) localStorage['screen_mode'] = ScreenMode.get();
            });
        };

        $scope.projects = projects;
    });
});
