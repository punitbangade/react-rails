class DropTasksTable < ActiveRecord::Migration[5.2]
  def up
    drop_table :tasks
  end

  def down
    create_table :tasks do |t|
      t.string :title
      t.boolean :completed
      t.timestamps
    end
  end
end
