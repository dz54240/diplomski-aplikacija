class SubjectForm < ApplicationForm
  private

  def before_save
    record.user = current_user if record.new_record?
  end
end
