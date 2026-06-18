const { pgTable, text, timestamp } = require("drizzle-orm/pg-core");

const users = pgTable("users", {
    id: text("id").primaryKey(),

    email: text("email").notNull().unique(),

    passwordHash: text("password_hash").notNull(),

    apiKey: text("api_key").unique(),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
});

module.exports = { users };