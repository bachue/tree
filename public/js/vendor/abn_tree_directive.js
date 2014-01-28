var module;

module = angular.module('angularBootstrapNavTree', []);

module.directive('abnTree', function($timeout) {
  return {
    restrict: 'E',
    templateUrl: '../../templates/abn_tree_template.html',
    scope: {
      treeData: '=',
      onSelect: '&',
      initialSelection: '='
    },
    link: function(scope, element, attrs) {
      var expand_level, for_each_branch, on_treeData_change, select_branch, selected_branch, select_branches;
      if (attrs.iconExpand == null) {
        attrs.iconExpand = 'icon-plus';
      }
      if (attrs.iconCollapse == null) {
        attrs.iconCollapse = 'icon-minus';
      }
      if (attrs.iconLeaf == null) {
        attrs.iconLeaf = 'icon-chevron-right';
      }
      if (attrs.expandLevel == null) {
        attrs.expandLevel = '3';
      }
      expand_level = parseInt(attrs.expandLevel, 10);
      scope.header = attrs.header;
      if (!scope.treeData) {
        alert('no treeData defined for the tree!');
        debugger;
        return;
      }
      if (scope.treeData.length == null) {
        if (treeData.label != null) {
          scope.treeData = [treeData];
        } else {
          alert('treeData should be an array of root branches');
          debugger;
          return;
        }
      }
      for_each_branch = function(f) {
        var do_f, root_branch, _i, _len, _ref, _results;
        do_f = function(branch, level) {
          var child, _i, _len, _ref, _results;
          f(branch, level);
          if (branch.children != null) {
            _ref = branch.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              _results.push(do_f(child, level + 1));
            }
            return _results;
          }
        };
        _ref = scope.treeData;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          root_branch = _ref[_i];
          _results.push(do_f(root_branch, 1));
        }
        return _results;
      };
      for_each_branch(function(b, level) {
        b.level = level;
        return b.expanded = b.level < expand_level;
      });
      selected_branch = null;
      select_branch = function(branch) {
        if (branch !== selected_branch) {
          if (selected_branch != null) {
            selected_branch.selected = false;
          }
          branch.selected = true;
          selected_branch = branch;
          if (branch.onSelect != null) {
            return $timeout(function() {
              return branch.onSelect(branch);
            });
          } else {
            if (scope.onSelect != null) {
              return $timeout(function() {
                return scope.onSelect({
                  branch: branch
                });
              });
            }
          }
        }
      };
      scope.user_clicks_branch = function(branch) {
        if (branch !== selected_branch) {
          return select_branch(branch);
        }
      };
      scope.tree_rows = [];
      on_treeData_change = function() {
        var add_branch_to_list, root_branch, _i, _len, _ref, _results;
        scope.tree_rows = [];
        for_each_branch(function(branch) {
          if (branch.children) {
            if (branch.children.length > 0) {
              return branch.children = branch.children.map(function(e) {
                if (typeof e === 'string') {
                  return {
                    label: e,
                    children: []
                  };
                } else {
                  return e;
                }
              });
            }
          } else {
            return branch.children = [];
          }
        });
        for_each_branch(function(b, level) {
          if (!b.uid) {
            return b.uid = "" + Math.random();
          }
        });
        add_branch_to_list = function(level, branch, visible) {
          var child, child_visible, tree_icon, _i, _len, _ref, _results;
          branch.parent = function() {
            var result;
            for_each_branch(function(br) {
              var children = br.children, i, len;
              if (children) {
                for (i = 0, len = br.children.length; i < len; i++) {
                  if (_.isEqual(children[i], branch)) {
                    result = br;
                    break;
                  };
                }
              }
            });
            return result;
          };
          branch.parents = function() {
            var current = branch, results = [];
            while (true) {
              if (current = current.parent())
                results.unshift(current);
              else
                break;
            }
            return results;
          }

          if (branch.expanded == null) {
            branch.expanded = false;
          }
          if (!branch.children || branch.children.length === 0) {
            tree_icon = attrs.iconLeaf;
          } else {
            if (branch.expanded) {
              tree_icon = attrs.iconCollapse;
            } else {
              tree_icon = attrs.iconExpand;
            }
          }
          scope.tree_rows.push({
            level: level,
            branch: branch,
            label: branch.label,
            tree_icon: tree_icon,
            visible: visible
          });
          if (branch.children != null) {
            _ref = branch.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              child_visible = visible && branch.expanded;
              _results.push(add_branch_to_list(level + 1, child, child_visible));
            }
            return _results;
          }
        };
        _ref = scope.treeData;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          root_branch = _ref[_i];
          _results.push(add_branch_to_list(1, root_branch, true));
        }
        return _results;
      };
      select_branches = function(initialSelection) {
        if (initialSelection != null) {
          if (initialSelection.indexOf('/') == -1) {
            for_each_branch(function(b) {
              if (b.label === initialSelection) {
                return select_branch(b);
              }
            });
          } else {
            var selections = initialSelection.split('/');
            var do_f = function(children, selections) {
              $timeout(function() {
                for (var i = 0, len = children.length; i < len; i++) {
                  if (children[i].label === selections[0]) {
                    select_branch(children[i]);
                    if (children[i].children) {
                      children[i].expanded = true;
                      for (var _i = 0, _len = children[i].children.length; _i < _len; _i++) {
                        var row = _.find(scope.tree_rows, function(row) { return row.branch == children[i].children[_i] });
                        row.visible = true;
                      }
                      do_f(children[i].children, selections.slice(1));
                    }
                    break;
                  }
                }
              });
            }
            do_f(scope.treeData, selections);
          }
        }
      }
      select_branches(attrs.initialSelection);
      scope.$watch('treeData', on_treeData_change, true);
      scope.$on('toSelectBranches', function(event, selection) {
        select_branches(selection);
      });
      scope.$emit('treeInitialized');
    }
  };
});
