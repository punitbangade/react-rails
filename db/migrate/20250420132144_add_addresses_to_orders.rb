class AddAddressesToOrders < ActiveRecord::Migration[5.2]
  def change
    add_column :orders, :shipping_address, :text
    add_column :orders, :billing_address, :text
    add_column :orders, :payment_id, :string
    add_column :orders, :payment_method, :string
  end
end
