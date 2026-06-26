class ApplicationSerializer
  attr_reader :object, :options

  def initialize(object, options = {})
    @object = object
    @options = options
  end

  def attributes
    raise NotImplementedError
  end

  def as_json(*)
    attributes
  end

  def self.collection(records, options = {})
    records.map { |r| new(r, options).attributes }
  end
end
