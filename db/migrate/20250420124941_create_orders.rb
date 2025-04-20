class CreateOrders < ActiveRecord::Migration[5.2]
  def change
    create_table :orders do |t|
      t.references :user, foreign_key: true, null: false
      t.string :status, null: false, default: 'cart'
      t.decimal :total, precision: 10, scale: 2, null: false, default: 0

      t.timestamps
    end

    add_index :orders, [:user_id, :status]
  end
end
