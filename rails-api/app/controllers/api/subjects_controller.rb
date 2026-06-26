module Api
  class SubjectsController < BaseController
    before_action :load_resource, only: %i[show update destroy]

    def index
      records = policy_scope(Subject).includes(:documents, :conversations, :quizzes)
      authorize Subject
      render_json(records)
    end

    def show
      authorize @resource
      render_json(@resource)
    end

    def create
      record = Subject.new
      authorize record
      result = SubjectForm.new(record: record, params: create_params, current_user: Current.user).perform
      return render_errors(result.errors) unless result.success?
      render_json_created(result.record)
    end

    def update
      authorize @resource
      result = SubjectForm.new(record: @resource, params: update_params, current_user: Current.user).perform
      return render_errors(result.errors) unless result.success?
      render_json(result.record)
    end

    def destroy
      authorize @resource
      @resource.destroy!
      head :no_content
    end

    private

    def load_resource
      @resource = Subject.find(params[:id])
    end

    def create_params
      params.require(:subject).permit(policy(Subject.new).permitted_attributes_for_create)
    end

    def update_params
      params.require(:subject).permit(policy(@resource).permitted_attributes_for_update)
    end
  end
end
