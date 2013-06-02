class Resolver < ActiveRecord::Base
  attr_accessible :device, :devtype, :imagehash, :ipadd, :latitude, :longitude, :porthttpd, :portsock, :userhandle, :userimage

#this will need to be adjusted later
RANGE = 100000

  def self.get_servers(lng, lat)
  
    rec = where("latitude > ? AND latitude < ? AND longitude > ? AND longitude < ? AND ipadd != ?", 
    lat.to_i - RANGE, lat.to_i + RANGE, lng.to_i - RANGE, lng.to_i + RANGE,"OFF")
  end
  
end
