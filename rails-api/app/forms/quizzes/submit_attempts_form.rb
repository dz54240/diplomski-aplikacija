module Quizzes
  class SubmitAttemptsForm < ApplicationForm
    NO_ANSWER_SENTINEL = '(no answer)'.freeze

    def perform
      return FormResult.failure(['quiz already completed']) if record.completed_at.present?
      return FormResult.failure(['attempts required']) if attempts_param.blank?

      validation_error = validate_attempts
      return FormResult.failure([validation_error]) if validation_error

      results = nil
      ActiveRecord::Base.transaction(requires_new: true) do
        rows = build_attempt_rows
        QuizAttempt.insert_all!(rows)
        record.update!(completed_at: Time.current)
        results = build_results(rows)
      end
      FormResult.success({ quiz_id: record.id, results: results })
    rescue ActiveRecord::RecordInvalid => e
      FormResult.failure(e.record.errors.full_messages)
    end

    private

    def attempts_param
      params[:attempts] || []
    end

    def validate_attempts
      ids = attempts_param.map { |a| a[:question_id] }
      return 'duplicate question_id in attempts' if ids.length != ids.uniq.length

      owned_ids = record.quiz_questions.pluck(:id)
      foreign = ids - owned_ids
      return "question_id not part of this quiz: #{foreign.first}" if foreign.any?

      nil
    end

    def build_attempt_rows
      now = Time.current
      questions_by_id = record.quiz_questions.index_by(&:id)
      attempts_param.map do |a|
        question = questions_by_id[a[:question_id]]
        selected = a[:selected].presence || NO_ANSWER_SENTINEL
        is_correct = (selected == question.correct_answer)
        {
          id: SecureRandom.uuid,
          user_id: current_user.id,
          quiz_question_id: question.id,
          selected: selected,
          is_correct: is_correct,
          time_taken_ms: a[:time_taken_ms],
          created_at: now,
          updated_at: now,
        }
      end
    end

    def build_results(rows)
      rows.map { |r| { question_id: r[:quiz_question_id], is_correct: r[:is_correct] } }
    end
  end
end
