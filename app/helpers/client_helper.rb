module ClientHelper
  
  def geturl
    
    if Rails.env.production? then
      url =  "http://www.fullsink.com"
    else 
      url = "http://192.168.1.126:3000"
    end
    return url
    
  end
end
