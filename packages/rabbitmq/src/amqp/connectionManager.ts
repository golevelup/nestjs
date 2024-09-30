import { AmqpConnection } from './connection';

export class AmqpConnectionManager {
  private connections: Map<string, AmqpConnection> = new Map();

  addConnection(connection: AmqpConnection) {
    this.connections.set(connection.configuration.name, connection);
  }

  getConnection(name: string) {
    return this.connections.get(name);
  }

  getConnections() {
    return Array.from(this.connections.values());
  }

  clearConnections() {
    this.connections.clear();
  }

  async close() {
    await Promise.all(
      Array.from(this.connections.values()).map((connection) =>
        connection.close()
      )
    );
  }
}
