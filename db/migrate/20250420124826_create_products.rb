class CreateProducts < ActiveRecord::Migration[5.2]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false, default: 0
      t.integer :stock, null: false, default: 0
      t.references :category, foreign_key: true
      t.string :image_url

      t.timestamps
    end

    add_index :products, :name
  end
end
