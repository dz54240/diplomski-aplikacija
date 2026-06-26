class FormResult
  attr_reader :record, :errors

  def self.success(record)
    new(success: true, record: record, errors: [])
  end

  def self.failure(errors)
    new(success: false, record: nil, errors: Array(errors))
  end

  def initialize(success:, record:, errors:)
    @success = success
    @record = record
    @errors = errors
  end

  def success? = @success
  def failure? = !@success
end
