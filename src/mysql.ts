import { Connection, createConnection } from 'mysql';
import { promisify } from 'util';
interface ConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class MySQL {
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
    //promisifying query for later use
    this.promosifiedQuery = promisify(this.connection.query).bind(this.connection);
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
  }

  public async fetchAllData(): Promise<{ table: string; columns: string[]; data: string[] }[]> {
    const tables = await this.fetchTables();

    return await Promise.all(
      tables.map(async (element: any) => {
        const table: string = element.TABLE_NAME;
        const [columns, data] = await Promise.all([this.fetchColumns(table), this.fetchTableData(table)]);
        return { table, columns, data };
      }),
    );
  }

  private async fetchTables(): Promise<string[]> {
    const query = `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA='${this.database}'`;
    let tables = [];

    try {
      //JSON.parse and JSON.stringify are used to remove the ROW_DATA_PACKET text returned from MySQL
      tables = JSON.parse(JSON.stringify(await this.promosifiedQuery(query)));
    } catch (error: any /* TODO figure out how to give this a type */) {
      console.log('Error while fetching tables');
      console.log(error.message);
    }
    return tables;
  }

  private async fetchColumns(tableName: string): Promise<string[]> {
    const query = `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${this.database}' AND TABLE_NAME='${tableName}'`;
    let columns = [];

    try {
      //JSON.parse and JSON.stringify are used to remove the ROW_DATA_PACKET text returned from MySQL
      columns = JSON.parse(JSON.stringify(await this.promosifiedQuery(query)));
    } catch (error: any /* TODO figure out how to give this a type */) {
      console.log('Error while fetching columns');
      console.log(error.message);
    }
    return columns;
  }

  private async fetchTableData(table: string): Promise<string[]> {
    const query = `SELECT * FROM ${table}`;
    let data = [];

    try {
      //JSON.parse and JSON.stringify are used to remove the ROW_DATA_PACKET text returned from MySQL
      data = JSON.parse(JSON.stringify(await this.promosifiedQuery(query)));
    } catch (error: any /* TODO figure out how to give this a type */) {
      console.log('Error while fetching data from table: ', table);
      console.log(error.message);
    }

    return data;
  }
}
