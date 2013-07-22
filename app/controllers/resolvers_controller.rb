class ResolversController < ApplicationController
  
  before_filter :authenticate_admin!, :except => [:upadd, :search]
  
  
  # GET /resolvers
  # GET /resolvers.json
  def index
    @resolvers = Resolver.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @resolvers }
    end
  end

  # GET /resolvers/1
  # GET /resolvers/1.json
  def show
    @resolver = Resolver.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @resolver }
    end
  end

  # GET /resolvers/new
  # GET /resolvers/new.json
  def new
    @resolver = Resolver.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @resolver }
    end
  end

  # GET /resolvers/1/edit
  def edit
    @resolver = Resolver.find(params[:id])
  end

  # POST /resolvers
  # POST /resolvers.json
  def create
    @resolver = Resolver.new(params[:resolver])

    respond_to do |format|
      if @resolver.save
        format.html { redirect_to @resolver, notice: 'Resolver was successfully created.' }
        format.json { render json: @resolver, status: :created, location: @resolver }
      else
        format.html { render action: "new" }
        format.json { render json: @resolver.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /resolvers/1
  # PUT /resolvers/1.json
  def update
    @resolver = Resolver.find(params[:id])

    respond_to do |format|
      if @resolver.update_attributes(params[:resolver])
        format.html { redirect_to @resolver, notice: 'Resolver was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @resolver.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /resolvers/1
  # DELETE /resolvers/1.json
  def destroy
    @resolver = Resolver.find(params[:id])
    @resolver.destroy

    respond_to do |format|
      format.html { redirect_to resolvers_url }
      format.json { head :no_content }
    end
  end
  
  
  def upadd
    updated = false
    
    rec = Resolver.find_or_initialize_by_device_and_devtype(params[:device],params[:devtype])
    
    xparam = params
    xparam.delete :action
    xparam.delete :controller
    
    if rec.update_attributes(xparam)  
      updated = true
    end
    
    render :json => { :rtn => updated }
  end
  
  def search
    rec = Resolver.get_servers(params[:lng], params[:lat], params[:userhandle])
 #   puts "Found : #{rec[0]}"
    render :json => rec
  end
end



