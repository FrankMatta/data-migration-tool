import { Connection, createConnection } from 'mysql';
import { promisify } from 'util';
import { GenericType } from './interfaces/common.interface';
import { MySQLConnectionParams } from './interfaces/connection-params';
/**
 * Class that does MySQL operations
 * @param MySQLConnectionParams
 */
export class MySQL extends MySQLConnectionParams {
  private connection!: Connection;
  private promosifiedQuery: any;

  constructor(connectionParams: MySQLConnectionParams) {
    super();
    const { database } = connectionParams;
    this.database = database;
    this.connectToMySQL(connectionParams);

    this.promosifiedQuery = promisify(this.connection.query).bind(
      this.connection,
    );
  }

  destructor() {
    if (this.connection) {
      this.connection.end();
    }
  }

  /**
   * Function to connect to MySQL
   * @param connectionParams
   */
  connectToMySQL(connectionParams: MySQLConnectionParams): void {
    const { host, port, user, password, database, ssl } = connectionParams;
    this.connection = createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl,
    });
    this.connection.connect(function (error) {
      if (error) {
        console.error('Error connecting to MySQL: ' + error.message);
        process.exit(1);
      }
      console.log('Successfully connected to MySQL');
    });
  }

  async fetchAllData(): Promise<
    { table: string; columns: string[]; data: GenericType[] }[]
  > {
    const tables = await this.fetchTables();

    return await Promise.all(
      tables.map(async (element: any) => {
        const table: string = element.TABLE_NAME;
        const [columns, data] = await Promise.all([
          this.fetchColumns(table),
          this.fetchTableData(table),
        ]);
        return { table, columns, data };
      }),
    );
  }

  async fetchTables(): Promise<{ TABLE_NAME: string }[]> {
    const query = `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA='${this.database}'`;
    let tables: { TABLE_NAME: string }[] = [];

    try {
      tables = await this.promosifiedQuery(query);
      //JSON.parse and JSON.stringify are used to remove the ROW_DATA_PACKET text returned from MySQL
      tables = JSON.parse(JSON.stringify(tables));
      return tables;
    } catch (error: any) {
      console.error('Error while fetching tables: ', error.message);
      process.exit(1);
    }
  }

  async fetchColumns(tableName: string): Promise<string[]> {
    const query = `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${this.database}' AND TABLE_NAME='${tableName}'`;
    let columns = [];

    try {
      columns = await this.promosifiedQuery(query);
      //JSON.parse and JSON.stringify are used to remove the ROW_DATA_PACKET text returned from MySQL
      columns = JSON.parse(JSON.stringify(columns));
    } catch (error: any) {
      console.error('Error while fetching columns: ', error.message);
      process.exit(1);
    }
    return columns;
  }

  async fetchTableData(table: string): Promise<string[]> {
    const query = `SELECT * FROM ${table}`;
    let data = [];

    try {
      data = await this.promosifiedQuery(query)
      //JSON.parse and JSON.stringify are used to remove the ROW_DATA_PACKET text returned from MySQL
      data = JSON.parse(JSON.stringify(data));
    } catch (error: any) {
      console.error('Error while fetching data from table: ', table);
      console.error(error.message);
      process.exit(1);
    }

    return data;
  }
}
