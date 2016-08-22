#Serve Static Assets
use Rack::Static, 
  :urls => [/.*\.(?:jpg|tiff|png|jpg|gif|ico|svg)$/], 
  :root => "public/images"
use Rack::Static, 
  :urls => [/.*\.(?:otf|woff|ttf)$/], 
  :root => "public/fonts"
use Rack::Static, 
  :urls => [/.*\.css(\.map)?$/], 
  :root => "public/styles"
use Rack::Static, 
  :urls => [/.*\.js$/], 
  :root => "public/scripts"
use Rack::Static, 
  :urls => [/.*\.json$/], 
  :root => "data"

# Run Server
run Proc.new { |env| 
  require "#{File.dirname(__FILE__)}/autoload.rb"

  begin
      uri = env["REQUEST_URI"].to_s
      App.serve(200, "index.html")
  rescue Exception => e
      App.serve(400, "404.html")
  end
}