module Api
  class QuizAttemptsController < BaseController
    def create
      authorize QuizAttempt
      quiz = policy_scope(Quiz).find(params[:quiz_id])
      authorize quiz, :submit_attempts?

      form = Quizzes::SubmitAttemptsForm.new(
        record: quiz,
        params: attempts_params,
        current_user: current_user,
      )
      result = form.perform
      if result.success?
        score = result.record[:results].count { |r| r[:is_correct] }
        total = result.record[:results].length
        render json: {
          data: {
            quiz_id: quiz.id,
            score: score,
            total: total,
            results: result.record[:results],
          },
        }, status: :ok
      else
        render json: { error: { code: 'validation_error', messages: result.errors } },
               status: :unprocessable_entity
      end
    end

    private

    def attempts_params
      {
        attempts: params.fetch(:attempts).map do |a|
          a.permit(:question_id, :selected, :time_taken_ms).to_h.deep_symbolize_keys
        end,
      }
    end
  end
end
