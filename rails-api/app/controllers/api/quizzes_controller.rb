module Api
  class QuizzesController < BaseController
    before_action :load_subject_if_nested, only: :index

    def index
      authorize Quiz
      records = policy_scope(Quiz)
                  .where(subject_id: params[:subject_id])
                  .order(created_at: :desc)
      render json: { data: records.map { |q| QuizSerializer.new(q).attributes } }, status: :ok
    end

    def show
      quiz = policy_scope(Quiz).find(params[:id])
      authorize quiz
      attempts = quiz.completed_at? ? quiz.quiz_attempts.where(user_id: current_user.id).to_a : []
      render json: { data: QuizSerializer.new(quiz).with_questions(attempts: attempts) }, status: :ok
    end

    private

    def load_subject_if_nested
      return unless params[:subject_id]

      subject = Subject.find(params[:subject_id])
      authorize subject, :show?
    end
  end
end
