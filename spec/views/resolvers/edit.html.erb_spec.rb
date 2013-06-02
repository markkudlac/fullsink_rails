require 'spec_helper'

describe "resolvers/edit" do
  before(:each) do
    @resolver = assign(:resolver, stub_model(Resolver,
      :device => "MyString",
      :devtype => "MyString",
      :userhandle => "MyString",
      :ipadd => "MyString",
      :portsock => 1,
      :porthttpd => 1,
      :longitude => 1,
      :latitude => 1,
      :userimage => "MyText",
      :imagehash => "MyString"
    ))
  end

  it "renders the edit resolver form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", resolver_path(@resolver), "post" do
      assert_select "input#resolver_device[name=?]", "resolver[device]"
      assert_select "input#resolver_devtype[name=?]", "resolver[devtype]"
      assert_select "input#resolver_userhandle[name=?]", "resolver[userhandle]"
      assert_select "input#resolver_ipadd[name=?]", "resolver[ipadd]"
      assert_select "input#resolver_portsock[name=?]", "resolver[portsock]"
      assert_select "input#resolver_porthttpd[name=?]", "resolver[porthttpd]"
      assert_select "input#resolver_longitude[name=?]", "resolver[longitude]"
      assert_select "input#resolver_latitude[name=?]", "resolver[latitude]"
      assert_select "textarea#resolver_userimage[name=?]", "resolver[userimage]"
      assert_select "input#resolver_imagehash[name=?]", "resolver[imagehash]"
    end
  end
end
