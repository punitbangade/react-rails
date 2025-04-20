Rails.application.routes.draw do
  # Admin routes
  namespace :admin do
    get '/', to: 'dashboard#index', as: :dashboard
    resources :products
    resources :categories
    resources :orders, only: [:index, :show, :update]
    resources :users, only: [:index, :show, :edit, :update] do
      member do
        patch :toggle_admin
      end
    end
  end

  # Authentication routes
  get '/login', to: 'sessions#new'
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'

  get '/signup', to: 'users#new'
  post '/signup', to: 'users#create'

  # API routes
  namespace :api do
    # Products
    resources :products, only: [:index, :show]

    # Categories
    resources :categories, only: [:index]

    # Orders
    resources :orders, only: [:create, :show]
    get '/cart', to: 'orders#cart'
    get '/cart/count', to: 'orders#cart_count'
    post '/orders/add_item', to: 'orders#add_item'
    delete '/orders/remove_item/:id', to: 'orders#remove_item'
    patch '/orders/update_item/:id', to: 'orders#update_item'

    # Payments
    post '/payments/process', to: 'payments#process_payment'
  end

  # Frontend routes
  get 'home/index'
  get '/products', to: 'home#products'
  get '/products/:id', to: 'home#product_detail', as: 'product_detail'
  get '/cart', to: 'home#cart'
  get '/checkout', to: 'home#checkout'
  get '/orders', to: 'home#orders'
  get '/orders/:id', to: 'home#order_detail', as: 'order_detail'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Set the root path
  root 'home#index'
end
