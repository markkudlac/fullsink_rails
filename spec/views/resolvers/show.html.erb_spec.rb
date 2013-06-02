require 'spec_helper'

describe "resolvers/show" do
  before(:each) do
    @resolver = assign(:resolver, stub_model(Resolver,
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
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Device/)
    rendered.should match(/Devtype/)
    rendered.should match(/Userhandle/)
    rendered.should match(/Ipadd/)
    rendered.should match(/1/)
    rendered.should match(/2/)
    rendered.should match(/3/)
    rendered.should match(/4/)
    rendered.should match(/MyText/)
    rendered.should match(/Imagehash/)
  end
end
