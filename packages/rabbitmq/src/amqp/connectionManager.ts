import { AmqpConnection } from './connection';

export class AmqpConnectionManager {
  private connections: AmqpConnection[] = [];

  addConnection(connection: AmqpConnection) {
    this.connections.push(connection);
  }

  getConnection(name: string) {
    return this.connections.find(
      (connection) => connection.configuration.name === name
    );
  }

  getConnections() {
    return this.connections;
  }

  clearConnections() {
    this.connections = [];
  }
}
