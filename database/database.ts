import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('words.db');

export default db;