# Active Storage attachments allowed across the app.
#
# `Document#file` accepts only application/pdf.
# `Document#parsed_output` accepts only application/json.
# Validation is enforced at the form layer; this initializer only adjusts
# Active Storage's response headers for safe inline preview.

Rails.application.config.active_storage.content_types_to_serve_as_binary += %w[
  application/pdf
]

Rails.application.config.active_storage.content_types_allowed_inline += %w[
  application/json
]
