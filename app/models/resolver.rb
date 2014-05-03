class Resolver < ActiveRecord::Base
#  attr_accessible :device, :devtype, :iprouter, :ipadd, :latitude,
#   :longitude, :porthttpd, :portsock, :userhandle, :netname
  
  
  def self.get_byrouter(router)
  
    if router == nil then 
      router = "NONE"
    end
    
    rec = where("iprouter LIKE ? AND ipadd != ?", router, "OFF").order("updated_at DESC").limit(255)
    
    
#    if (userhandle != nil && userhandle.length() > 0) then
#      nam = where("userhandle LIKE ? AND ipadd != ?", userhandle, "OFF").order("updated_at DESC").limit(50)
#      rec = rec + nam
#    end
    
    return rec
  end
end
