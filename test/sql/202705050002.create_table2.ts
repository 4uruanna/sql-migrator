export default {
  up: () => `
    CREATE TABLE public.test2 (
      id    SERIAL PRIMARY KEY,
      name  VARCHAR(255) NOT NULL,
      tid   INTEGER NOT NULL REFERENCES test (id)
    );
  `,
  down: () => `DROP TABLE public.test2;`
}

