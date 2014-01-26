class GitRepoUrl < Grape::Validations::Validator
  def validate_param! attr_name, params
    unless Git::Utils.valid_git_repo? params[attr_name]
      raise Grape::Exceptions::Validation, param: @scope.full_name(attr_name), message: "scheme of url must be one of [http, https, git, ssh]"
    end
  end
end