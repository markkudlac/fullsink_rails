class CreateResolvers < ActiveRecord::Migration
  def change
    create_table :resolvers do |t|
      t.string :device,          :limit => 40, :null => false
      t.string :devtype,         :limit => 1, :null => false 
      t.string :userhandle,      :limit => 15
      t.string :ipadd
      t.integer :portsock
      t.integer :porthttpd
      t.integer :longitude
      t.integer :latitude
      t.text :userimage,         :limit => 12000
      t.string :imagehash,       :limit => 50

      t.timestamps
    end
    add_index :resolvers, [:device, :devtype], :unique => true
    add_index :resolvers, :userhandle
    add_index :resolvers, :longitude
    add_index :resolvers, :latitude
  end
end
