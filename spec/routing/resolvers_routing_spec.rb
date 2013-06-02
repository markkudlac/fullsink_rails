require "spec_helper"

describe ResolversController do
  describe "routing" do

    it "routes to #index" do
      get("/resolvers").should route_to("resolvers#index")
    end

    it "routes to #new" do
      get("/resolvers/new").should route_to("resolvers#new")
    end

    it "routes to #show" do
      get("/resolvers/1").should route_to("resolvers#show", :id => "1")
    end

    it "routes to #edit" do
      get("/resolvers/1/edit").should route_to("resolvers#edit", :id => "1")
    end

    it "routes to #create" do
      post("/resolvers").should route_to("resolvers#create")
    end

    it "routes to #update" do
      put("/resolvers/1").should route_to("resolvers#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/resolvers/1").should route_to("resolvers#destroy", :id => "1")
    end

  end
end
