require 'digest'

class QuizQuestionSerializer < ApplicationSerializer
  # Public view sent to client: 4 shuffled options, NO correct_answer field.
  def as_view
    {
      id:          object.id,
      position:    object.position,
      stem:        object.stem,
      options:     shuffled_options,
      bloom_level: object.bloom_level,
      topic:       object.topic,
    }
  end

  # Internal view (used by SubmitAttemptsForm) — includes correct_answer for resolution.
  def as_internal
    as_view.merge(correct_answer: object.correct_answer)
  end

  private

  def shuffled_options
    all = [object.correct_answer, *object.distractors]
    seed = Digest::SHA256.hexdigest(object.id)[0..15].to_i(16)
    all.shuffle(random: Random.new(seed))
  end
end
