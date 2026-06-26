class ApplicationForm
  include ActiveModel::Model

  def initialize(record:, params: {}, current_user: nil)
    @record = record
    @params = params.to_h.deep_symbolize_keys
    @current_user = current_user
  end

  def perform
    return FormResult.failure(errors.full_messages) unless valid?
    persist_record
    FormResult.success(record)
  rescue ActiveRecord::RecordInvalid => e
    FormResult.failure(e.record.errors.full_messages)
  end

  private

  attr_reader :record, :params, :current_user

  def persist_record
    ActiveRecord::Base.transaction(requires_new: true) do
      before_assign
      record.assign_attributes(params)
      before_save
      record.save!
      after_save
    end
  end

  def before_assign; end
  def before_save; end
  def after_save; end

  def raise_record_invalid(field, message)
    record.errors.add(field, message)
    raise ActiveRecord::RecordInvalid, record
  end
end
