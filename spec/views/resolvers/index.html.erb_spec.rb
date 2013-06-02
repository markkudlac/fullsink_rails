require 'spec_helper'

describe "resolvers/index" do
  before(:each) do
    assign(:resolvers, [
      stub_model(Resolver,
        :device => "Device",
        :devtype => "Devtype",
        :userhandle => "Userhandle",
        :ipadd => "Ipadd",
        :portsock => 1,
        :porthttpd => 2,
        :longitude => 3,
        :latitude => 4,
        :userimage => "MyText",
        :imagehash => "Imagehash"
      ),
      stub_model(Resolver,
        :device => "Device",
        :devtype => "Devtype",
        :userhandle => "Userhandle",
        :ipadd => "Ipadd",
        :portsock => 1,
        :porthttpd => 2,
        :longitude => 3,
        :latitude => 4,
        :userimage => "MyText",
        :imagehash => "Imagehash"
      )
    ])
  end

  it "renders a list of resolvers" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Device".to_s, :count => 2
    assert_select "tr>td", :text => "Devtype".to_s, :count => 2
    assert_select "tr>td", :text => "Userhandle".to_s, :count => 2
    assert_select "tr>td", :text => "Ipadd".to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
    assert_select "tr>td", :text => 2.to_s, :count => 2
    assert_select "tr>td", :text => 3.to_s, :count => 2
    assert_select "tr>td", :text => 4.to_s, :count => 2
    assert_select "tr>td", :text => "MyText".to_s, :count => 2
    assert_select "tr>td", :text => "Imagehash".to_s, :count => 2
  end
end
