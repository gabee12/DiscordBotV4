// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const queue = new Map();

module.exports = {
	getQueueInstance: function() {
		return queue;
	},
};