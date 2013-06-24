class Resolver < ActiveRecord::Base
  attr_accessible :device, :devtype, :ipadd, :latitude,
   :longitude, :porthttpd, :portsock, :userhandle

#this will need to be adjusted later
RANGE = 500000

  def self.get_servers(lng, lat, userhandle)
  
    rec = where("latitude > ? AND latitude < ? AND longitude > ? AND longitude < ? AND ipadd != ?", 
    lat.to_i - RANGE, lat.to_i + RANGE, lng.to_i - RANGE, lng.to_i + RANGE,"OFF")
    
    if (userhandle.length() > 0) then
      nam = where("userhandle LIKE ? AND ipadd != ?", userhandle, "OFF")
      rec = rec + nam
    end
    
    return rec
  end
  
end
