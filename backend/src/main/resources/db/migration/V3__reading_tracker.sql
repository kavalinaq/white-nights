CREATE TABLE reading_tracker (
  user_id    BIGINT REFERENCES users(user_id),
  date       DATE NOT NULL,
  pages_read INT,
  PRIMARY KEY (user_id, date)
);
