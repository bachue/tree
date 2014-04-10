require 'nokogiri'

module CommentsPreHandler
  def render txt
    id_comment_pair = {}
    txt << "\n" unless txt.end_with? "\n" # Append newline automatically
    result =  txt.gsub(/\<([^\<\>]+)\>:\s*(.*?)(?=\n\s*(\n|\<|$))/m) do
                id_comment_pair[$1] = $2
                nil
              end.gsub(/\[([^\[\]]+)\]\s*\<([^\<\>]+)\>/) do |matched|
                content, id = $1, $2
                if id_comment_pair[id]
                  compile(content.strip, id_comment_pair[id].strip);
                else
                  matched
                end
              end.gsub(/\[([^\[\]]+)\]{([^{}]+)}/) do
                compile($1.strip, $2.strip)
              end
    super result
  end

  private
    def build &block
      html = Nokogiri::HTML::DocumentFragment.parse ''
      Nokogiri::HTML::Builder.with html, &block
      html.to_html
    end

    def compile content, comments
      comments = comments.split("\n").inject([]) do |list, comment|
        if comment =~ /(\w+):(.*)$/
          list << {author: $1.strip, comments: [$2.strip]}
        elsif list.empty?
          list << {comments: [comment.strip]}
        else
          list.last[:comments] << comment.strip
        end
        list
      end

      comments.map! do |comment|
        build do |doc|
          doc.div class: 'panel panel-default panel-comments' do
            doc.div comment[:author], class: 'panel-heading' if comment[:author]
            if comment[:comments].present?
              doc.div class: 'panel-body' do
                comment[:comments].each do |text|
                  doc.div text
                end
              end
            end
          end
        end.gsub("\n", '')
      end

      build do |doc|
        doc.span content,
        'class'          => 'annotated',
        'data-container' => 'body',
        'data-toggle'    => 'popover',
        'data-placement' => 'left',
        'data-animation' => 'true',
        'data-html'      => 'true',
        'data-trigger'   => 'manual',
        'data-content'   => comments.join
      end
    end
end
