const sqlite3 = require('sqlite3').verbose();
const today = new Date();

const db = new sqlite3.Database('event_data.db');
const songYear = 'songs' + String(today.getFullYear());
const songMonth = 'songs' + String((today.getMonth() + 1));
const artistYear = 'artists' + String(today.getFullYear());
const artistMonth = 'artists' + String((today.getMonth() + 1));

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

function getArtistCount(artistName, callback, num) {
	db.get(`SELECT count FROM song${num} WHERE artistName = ?1`, [artistName], (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err, null);
		}
		else {
			callback(null, row ? row.count : 0);
		}
	});
}

function getArtist(id, callback, num) {
	db.get(`SELECT artistName FROM artists${num} WHERE id = ?1`, [id], (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err, null);
		}
		else {
			callback(null, row ? row.artistName : 0);
		}
	});
}

function getArtistTimePlayed(artistName, callback, num) {
	db.get(`SELECT timePlayed FROM artists${num} WHERE artistName = ?1`, [artistName], (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err, null);
		}
		else {
			callback(null, row ? row.timePlayed : 0);
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


function getSongTimePlayed(songName, callback, num) {
	db.get(`SELECT timePlayed FROM songs${num} WHERE songName = ?1`, [songName], (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err, null);
		}
		else {
			callback(null, row ? row.timePlayed : 0);
		}
	});
}

function getSongCount(songName, callback, num) {
	db.get(`SELECT count FROM songs${num} WHERE songName = ?1`, [songName], (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err, null);
		}
		else {
			callback(null, row ? row.count : 0);
		}
	});
}

function getSong(id, callback, num) {
	db.get(`SELECT songName FROM songs${num} WHERE id = ?1`, [id], (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err, null);
		}
		else {
			callback(null, row ? row.songName : 0);
		}
	});
}

function getTotalTime(num) {
	return new Promise((resolve, reject) => {
		db.get(`SELECT SUM(timePlayed) AS time FROM songs${num}`, (err, row) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			else {
				resolve(row ? row.time : 0);
			}
		});
	});
}

module.exports = {
	getArtist,
	getArtistCount,
	getArtistTimePlayed,
	getSong,
	getSongTimePlayed,
	getSongCount,
	registerArtist,
	registerSong,
	getTotalTime,
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