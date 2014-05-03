class ResolversController < ApplicationController
  
  before_filter :authenticate_admin!, :except => [:upadd, :search, :router]
  
  
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
    @resolver = Resolver.new(resolver_params(params))

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
      if @resolver.update(resolver_params(params))
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
    
 # <4.0   rec = Resolver.find_or_initialize_by_device_and_devtype(params[:device],params[:devtype])
    rec = Resolver.where(device: params[:device],
      devtype: params[:devtype]).first_or_initialize
#    rec = Resolver.where(device: "abc", devtype: "X")
 #   rec = Resolver.where(device: "abc").first_or_initialize
    
        
    xparam = params
    xparam.delete :action
    xparam.delete :controller
    
    if Rails.env.production?
      xparam[:iprouter] = request.remote_ip
    else
      xparam[:iprouter] = "TEST_IP"
    end
      
#    puts "THis is the IP Address : #{request.remote_ip}"
#

    if rec.update(resolver_params(xparam)) 
      updated = true
    end
    
    render :json => { :rtn => updated }
  end
  
  
  def router
    
     if Rails.env.production?
        iprouter = request.remote_ip
      else
        iprouter = "TEST_IP"
      end
      
#    rec = Resolver.get_byrouter(iprouter, params[:userhandle])
    rec = Resolver.get_byrouter(iprouter)
 #   puts "Found : #{rec[0]}"
    render :json => rec
  end
  
  def resolver_params(xparams)
#    puts "PARAMS PASSED : #{xparams}"
     xparams = xparams.require(:resolver) if xparams[:resolver]
     
      xparams.permit(:device, :devtype, :userhandle, :netname,
          :iprouter, :ipadd, :portsock, :porthttpd)
  end
  
end



