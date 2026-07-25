async function foo() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    console.log(createServer);
  }
}
foo();
