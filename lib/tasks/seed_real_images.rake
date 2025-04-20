namespace :db do
  namespace :seed do
    desc "Seed products with real images"
    task real_images: :environment do
      load Rails.root.join('db/seeds/real_images.rb')
    end
  end
end
