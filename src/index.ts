import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Data Migration tool listening on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('App is up and running');
});
