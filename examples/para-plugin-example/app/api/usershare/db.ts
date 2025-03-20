import Datastore from 'nedb';

// Create an in-memory database instance
const db = new Datastore({ inMemoryOnly: true });

export default db; 