import { Connection, createConnection } from 'mysql';

class MySQL {
  private host: string;
  private port: number;
  private user: string;
  private password: string;
  private database: string;
  private connection!: Connection;

  constructor(host: string, port: number, user: string, password: string, database: string) {
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
  }
}
