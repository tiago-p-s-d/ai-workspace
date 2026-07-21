/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('chats', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.integer('user_id').unsigned().notNullable();
    table.string('title').notNullable().defaultTo('Novo Chat');
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.uuid('chat_id').notNullable();
    table.enum('sender', ['user', 'assistant']).notNullable();
    table.text('content').notNullable();
    table.timestamps(true, true);

    table.foreign('chat_id').references('id').inTable('chats').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('chats');
};