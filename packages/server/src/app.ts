// @ts-check
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { port, UploadDirectory } from './env';
import { FileExpressController, UserExpressController } from './controllers';
import { InitServerIdentity } from './convector';
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import * as expressHandlebars from "express-handlebars";
import { File } from './utils';

async function AppSetup() {

  File.DirectoryCreate(UploadDirectory);

  const app = express();

  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '40mb'
  }));
  app.use(bodyParser.json({ limit: '40mb' }));

  app.use(cookieParser());
  app.use(cors());

  app.set('views', path.join(__dirname, '/../views/'));
  app.use(express.static(path.join(__dirname, "/../static/")));
  app.engine('hbs', expressHandlebars({extname: "hbs"}));
  app.set('view engine', 'hbs');

  app.use('/file', FileExpressController);
  app.use('/user', UserExpressController);

  app.use("/", (req: express.Request, res: express.Response) => {
    return res.send("Please GO to /file and /user");
  });

  await InitServerIdentity();

  return app;
}

AppSetup().then(app =>
  app.listen(port, () =>
    console.log(`Server started in port ${port}`)
  )
);
