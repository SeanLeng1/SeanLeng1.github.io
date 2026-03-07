# _plugins/fix_charset_error.rb
module Jekyll
    module Commands
      class Serve
        class Servlet
          # Override the original method to avoid calling .key? on nil
          def conditionally_inject_charset(res, req)
            content_type = res["content-type"]
            # Return immediately if content_type is nil
            return unless content_type
  
            return if already_has_charset?(res)
            return unless should_inject?(content_type, req.path)
            res["content-type"] = "#{content_type}; charset=utf-8"
          end
        end
      end
    end
  end
  