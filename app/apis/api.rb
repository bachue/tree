class API < Grape::API
  format :json
  
  desc 'Only for test'
  get '/ping' do
    'pong'
  end
end
