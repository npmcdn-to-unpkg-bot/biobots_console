class App
  def self.serve(status, filename, headers: [])
    content = File.new("view/#{filename}", "r")
    [status, headers, content]
  end
end