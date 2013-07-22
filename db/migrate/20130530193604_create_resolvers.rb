class CreateResolvers < ActiveRecord::Migration
  def change
    create_table :resolvers do |t|
      t.string :device,          :limit => 20, :null => false
      t.string :devtype,         :limit => 1, :null => false 
      t.string :userhandle,      :limit => 20
      t.string :ipadd,           :limit => 15, :default => "OFF", :null => false
      t.integer :portsock,       :default => 0
      t.integer :porthttpd,      :default => 0
      t.integer :longitude,      :default => 1810000000
      t.integer :latitude,       :default => 1810000000

      t.timestamps
    end
    add_index :resolvers, [:device, :devtype], :unique => true
    add_index :resolvers, :userhandle
    add_index :resolvers, :longitude
    add_index :resolvers, :latitude
  end
end
