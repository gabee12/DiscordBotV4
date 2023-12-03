const today = new Date(2023, 11, 1);

// const songMonth = 'songs' + String((today.getMonth() + 1));

const songMonth = 'songs' + today.toLocaleString('pt-BR', { month: 'short' });

console.log(songMonth);

console.log(today.toLocaleString('pt-BR', { month: 'short' }));
