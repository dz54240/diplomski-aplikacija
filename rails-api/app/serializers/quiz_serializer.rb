class QuizSerializer < ApplicationSerializer
  def attributes
    {
      id:           object.id,
      subject_id:   object.subject_id,
      title:        object.title,
      bloom_focus:  object.bloom_focus,
      completed_at: object.completed_at&.iso8601,
      created_at:   object.created_at.iso8601,
      question_count: object.quiz_questions.size,
    }
  end

  def with_questions(attempts: [])
    reveal = object.completed_at?
    attributes.merge(
      questions: object.quiz_questions.map { |q|
        s = QuizQuestionSerializer.new(q)
        reveal ? s.as_internal : s.as_view
      },
      attempt: attempt_summary(attempts),
    )
  end

  private

  def attempt_summary(attempts)
    return nil if attempts.empty?

    answers = attempts.map do |a|
      { question_id: a.quiz_question_id, selected: a.selected, is_correct: a.is_correct }
    end
    {
      score: answers.count { |a| a[:is_correct] },
      total: object.quiz_questions.size,
      answers: answers,
    }
  end
end
