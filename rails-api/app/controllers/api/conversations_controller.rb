module Api
  class ConversationsController < BaseController
    before_action :load_subject_if_nested, only: :index

    def index
      authorize Conversation
      records = policy_scope(Conversation)
                  .active
                  .where(subject_id: params[:subject_id])
                  .order(updated_at: :desc)
      render_json(records)
    end

    def show
      conversation = policy_scope(Conversation).find(params[:id])
      authorize conversation
      render json: {
        data: ConversationSerializer.new(conversation).attributes.merge(
          messages: MessageSerializer.collection(conversation.messages.order(:created_at)),
        ),
      }, status: :ok
    end

    private

    def load_subject_if_nested
      return unless params[:subject_id]

      subject = Subject.find(params[:subject_id])
      authorize subject, :show?
    end
  end
end
