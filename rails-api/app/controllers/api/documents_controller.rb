module Api
  class DocumentsController < BaseController
    before_action :load_subject_if_nested, only: %i[index create]
    before_action :preload_resource,       only: %i[show destroy retry parsed_blocks]

    def index
      authorize Document
      docs = policy_scope(Document).where(subject_id: params[:subject_id]).ordered_recent
      render_json(docs)
    end

    def create
      authorize Document
      form = DocumentForm.new(
        record: Document.new(subject_id: params[:subject_id]),
        params: create_params.to_h.merge(subject_id: params[:subject_id]),
        current_user: Current.user,
      )
      result = form.perform

      if result.success?
        ProcessDocumentJob.perform_later(result.record.id)
        render_json_created(result.record)
      elsif form.duplicate?
        render json: {
          duplicate: true,
          existing_document_id: form.existing_document.id,
          message: "Dokument već postoji u tvojim materijalima",
          link: "/subjects/#{form.existing_document.subject_id}/documents/#{form.existing_document.id}",
        }, status: :ok
      else
        render_errors(result.errors)
      end
    end

    def show
      render_json(@resource)
    end

    def destroy
      @resource.destroy
      head :no_content
    end

    def retry
      unless %w[failed uploaded].include?(@resource.status)
        return render_errors(["Document is currently #{@resource.status}; retry not permitted"])
      end
      @resource.update!(status: "uploaded", error_msg: nil)
      ProcessDocumentJob.perform_later(@resource.id)
      render_json(@resource)
    end

    def parsed_blocks
      unless @resource.parsed_output.attached?
        return render json: { errors: ["parsed_output not available"] }, status: :not_found
      end

      raw  = @resource.parsed_output.download
      data = JSON.parse(raw)
      Documents::ImageUrlEnricherService.new(data).call
      render json: { data: data }, status: :ok
    end

    private

    def load_subject_if_nested
      return unless params[:subject_id]
      @subject = Subject.find(params[:subject_id])
      authorize @subject, :show?
    end

    def preload_resource
      @resource = Document.find(params[:id])
      authorize @resource
    end

    def create_params
      data_params.permit(*policy(Document.new).permitted_attributes_for_create)
    end

    def data_params
      params.fetch(:data, params)
    end
  end
end
