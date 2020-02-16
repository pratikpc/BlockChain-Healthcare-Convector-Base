// @ts-check
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { port } from './env';
import { ParticipantExpressController, PersonExpressController } from './controllers';
import { InitServerIdentity } from './convector';


async function AppSetup() {
  const app = express();

  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '40mb'
  }));
  app.use(bodyParser.json({ limit: '40mb' }));

  app.use('/participant', ParticipantExpressController);
  app.use('/person', PersonExpressController);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });

  await InitServerIdentity();

  return app;
}

AppSetup().then(app =>
  app.listen(port, () =>
    console.log(`Server started in port ${port}`)
  )
);
