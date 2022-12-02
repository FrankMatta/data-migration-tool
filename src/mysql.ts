import { Connection, createConnection } from 'mysql';
import { promisify } from 'util';
interface ConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

class MySQL {
  private host: string;
  private port: number;
  private user: string;
  private password: string;
  private database: string;
  private connection!: Connection;
  private promosifiedQuery: any; // TODO figure out how to give this a type

  constructor(connection: ConnectionParams) {
    const { host, port, user, password, database } = connection;
    this.host = host;
    this.port = port;
    this.user = user;
    this.password = password;
    this.database = database;
    this.connectToMySQL();
  }

  destructor() {
    if (this.connection) {
      this.connection.end();
    }
  }

  private connectToMySQL(): void {
    this.connection = createConnection({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: this.database,
    });

    this.connection.connect(function (error) {
      if (error) {
        console.error('error connecting to MySQL: ' + error.message);
        return;
      }

      console.log('Successfully connected to MySQL');
    });

    //promisifying query for later use
    this.promosifiedQuery = promisify(this.connection.query).bind(this.connection);
  }

  public async migrateAllTables(): Promise<void> {
    const tables = await this.fetchTables();
    tables.forEach((element: any) => {
      console.log('Table name: ', element.TABLE_NAME);
    });
  }

  private async fetchTables(): Promise<string[]> {
    const query = `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA='${this.database}'`;
    let data = [];

    try {
      data = await this.promosifiedQuery(query);
    } catch (error: any /* TODO figure out how to give this a type */) {
      console.log('Error while fetching tables');
      console.log(error.message);
    }
    return data;
  }
}
