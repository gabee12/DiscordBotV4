const sqlite3 = require('sqlite3').verbose();
const today = new Date();

const db = new sqlite3.Database('event_data.db');
const songYear = 'songs' + String(today.getFullYear());
const songMonth = 'songs' + getMonthName() + String(today.getFullYear());
const artistYear = 'artists' + String(today.getFullYear());
const artistMonth = 'artists' + getMonthName() + String(today.getFullYear());

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS ${artistYear} (id INTEGER PRIMARY KEY AUTOINCREMENT, artistName TEXT UNIQUE, count INTEGER DEFAULT 0, timePlayed INTEGER)`);
	db.run(`CREATE TABLE IF NOT EXISTS ${songYear} (id INTEGER PRIMARY KEY AUTOINCREMENT, songName TEXT UNIQUE, count INTEGER DEFAULT 0, timePlayed INTEGER)`);
	db.run(`CREATE TABLE IF NOT EXISTS ${artistMonth} (id INTEGER PRIMARY KEY AUTOINCREMENT, artistName TEXT UNIQUE, count INTEGER DEFAULT 0, timePlayed INTEGER)`);
	db.run(`CREATE TABLE IF NOT EXISTS ${songMonth} (id INTEGER PRIMARY KEY AUTOINCREMENT, songName TEXT UNIQUE, count INTEGER DEFAULT 0, timePlayed INTEGER)`);
});

function registerArtist(artistName, playedTime) {
	db.run(`INSERT INTO ${artistYear} (artistName, count, timePlayed) VALUES (?1, 1, ?2) ON CONFLICT(artistName) DO UPDATE SET count=count+1, timePlayed=timePlayed + ?2 WHERE artistName = ?1`, [artistName, playedTime], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
	db.run(`INSERT INTO ${artistMonth} (artistName, count, timePlayed) VALUES (?1, 1, ?2) ON CONFLICT(artistName) DO UPDATE SET count=count+1, timePlayed=timePlayed + ?2 WHERE artistName = ?1`, [artistName, playedTime], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

function registerSong(songName, playedTime) {
	db.run(`INSERT INTO ${songYear}(songName, count, timePlayed) VALUES (?1, 1, ?2) ON CONFLICT(songName) DO UPDATE SET count=count+1, timePlayed=timePlayed+?2 WHERE songName = ?1`, [songName, playedTime], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
	db.run(`INSERT INTO ${songMonth}(songName, count, timePlayed) VALUES (?1, 1, ?2) ON CONFLICT(songName) DO UPDATE SET count=count+1, timePlayed=timePlayed+?2 WHERE songName = ?1`, [songName, playedTime], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

async function getTotalTime(month, year) {
	return new Promise((resolve, reject) => {
		db.get(`SELECT SUM(timePlayed) AS time FROM songs${month}${year}`, (err, row) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(row.time);
		});
	});
}

async function getArtistsSorted(month, year) {
	return new Promise((resolve, reject) => {
		db.all(`SELECT artistName, timePlayed, count FROM artists${month}${year} ORDER BY count DESC, timePlayed DESC, artistName`, (err, row) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve(row);
		});
	});
}

function getMonthName() {
	let name = today.toLocaleString('pt-Br', { month: 'short' }).slice(0, -1);
	name = name[0].toUpperCase() + name.slice(1);
	return name;
}

module.exports = {
	registerArtist,
	registerSong,
	getTotalTime,
	getMonthName,
	getArtistsSorted,
};

process.on('exit', () => {
	db.close((err) => {
		if (err) {
			console.error('DB EXIT ERROR: ', err.message);
		}
		else {
			console.log('DB Connection Closed');
		}
	});
});