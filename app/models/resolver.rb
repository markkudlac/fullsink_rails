class Resolver < ActiveRecord::Base
  attr_accessible :device, :devtype, :iprouter, :ipadd, :latitude,
   :longitude, :porthttpd, :portsock, :userhandle, :netname

#this will need to be adjusted later
RANGE = 500000

  def self.get_servers(lng, lat, userhandle)
  
    rec = where("latitude > ? AND latitude < ? AND longitude > ? AND longitude < ? AND ipadd != ?", 
    lat.to_i - RANGE, lat.to_i + RANGE, lng.to_i - RANGE, lng.to_i + RANGE,"OFF")
    
    if (userhandle != nil && userhandle.length() > 0) then
      nam = where("userhandle LIKE ? AND ipadd != ?", userhandle, "OFF")
      rec = rec + nam
    end
    
    return rec
  end
  
  
  def self.get_byrouter(router, userhandle)
  
    if router == nil then 
      router = "NONE"
    end
    
    rec = where("iprouter LIKE ? AND ipadd != ?", router, "OFF").order("updated_at DESC").limit(255)
    
    if (userhandle != nil && userhandle.length() > 0) then
      nam = where("userhandle LIKE ? AND ipadd != ?", userhandle, "OFF").order("updated_at DESC").limit(50)
      rec = rec + nam
    end
    
    return rec
  end
end
