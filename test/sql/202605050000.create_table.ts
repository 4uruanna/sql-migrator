export default {
  up: () => `
    CREATE TABLE public.test (
      id    SERIAL PRIMARY KEY,
      name  VARCHAR(255) NOT NULL
    );
    `,

  down: () => `DROP TABLE public.test;`
}

