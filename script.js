//  Инфа 
var PRICE = 350;      // цена одного билета
var ROWS = 10;        // рядов
var SEATS_IN_ROW = 15; // мест в ряду

//  Элементы со страницы 
var movieName = document.getElementById('movieName');
var movieTime = document.getElementById('movieTime');
var sessionSelect = document.getElementById('sessionSelect');
var seatsDiv = document.getElementById('seats');
var selectedList = document.getElementById('selectedList');
var emptyText = document.getElementById('emptyText');
var totalSum = document.getElementById('totalSum');
var bookForm = document.getElementById('bookForm');
var userName = document.getElementById('userName');
var userPhone = document.getElementById('userPhone');
var nameError = document.getElementById('nameError');
var phoneError = document.getElementById('phoneError');
var bookBtn = document.getElementById('bookBtn');

//  проверка
var nameRegex = /^[A-Za-zА-Яа-яЁё]{2,30}$/;
var phoneRegex = /^(\+7|8)\d{10}$/;

//  Создание сеансов 
function createSeats() {
    var seats = [];
    for (var row = 1; row <= ROWS; row++) {
        for (var num = 1; num <= SEATS_IN_ROW; num++) {
            var status = 'free';
            // часть мест делаем занятыми случайно
            if (Math.random() < 0.2) {
                status = 'occupied';
            }
            seats.push({ row: row, number: num, status: status });
        }
    }
    return seats;
}

function createSessions() {
    var sessions = [
        { id: 1, movie: 'Интерстеллар', date: '2026-11-05 18:00', seats: createSeats() },
        { id: 2, movie: 'Начало', date: '2026-11-05 20:30', seats: createSeats() },
        { id: 3, movie: 'Матрица', date: '2026-11-06 19:00', seats: createSeats() }
    ];
    return sessions;
}

//  Работа с хранилищами 
function loadSessions() {
    var data = localStorage.getItem('sessions');
    if (data === null) {
        var newSessions = createSessions();
        localStorage.setItem('sessions', JSON.stringify(newSessions));
        return newSessions;
    }
    return JSON.parse(data);
}

function saveSessions() {
    localStorage.setItem('sessions', JSON.stringify(sessions));
}

function saveSelected() {
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
}

//  Данные 
var sessions = loadSessions();

var currentSessionId = Number(sessionStorage.getItem('sessionId'));
if (!currentSessionId) {
    currentSessionId = sessions[0].id;
    sessionStorage.setItem('sessionId', currentSessionId);
}

var selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats'));
if (selectedSeats === null) {
    selectedSeats = [];
}

// текущий сеан
function getCurrentSession() {
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].id === currentSessionId) {
            return sessions[i];
        }
    }
    return sessions[0];
}

//  Шапка и выбор сеанса 
function fillSelect() {
    sessionSelect.innerHTML = '';
    for (var i = 0; i < sessions.length; i++) {
        var option = document.createElement('option');
        option.value = sessions[i].id;
        option.textContent = sessions[i].movie + ' (' + sessions[i].date + ')';
        if (sessions[i].id === currentSessionId) {
            option.selected = true;
        }
        sessionSelect.appendChild(option);
    }
}

function showHeader() {
    var session = getCurrentSession();
    movieName.textContent = session.movie;
    movieTime.textContent = 'Сеанс: ' + session.date;
}

// зал 
function drawSeats() {
    seatsDiv.innerHTML = '';
    var session = getCurrentSession();

    for (var i = 0; i < session.seats.length; i++) {
        var seat = session.seats[i];

        var seatDiv = document.createElement('div');
        seatDiv.className = 'seat ' + seat.status;
        seatDiv.textContent = seat.number;
        seatDiv.title = 'Ряд ' + seat.row + ', Место ' + seat.number;

        // запоминаем номер места в массиве
        seatDiv.dataset.index = i;

        seatDiv.addEventListener('click', onSeatClick);
        seatsDiv.appendChild(seatDiv);
    }
}

//  Клик по месту 
function onSeatClick(event) {
    var index = event.target.dataset.index;
    var session = getCurrentSession();
    var seat = session.seats[index];

    // занятые места
    if (seat.status === 'occupied') {
        return;
    }

    if (seat.status === 'free') {
        seat.status = 'booked';
        selectedSeats.push({ row: seat.row, number: seat.number });
    } else if (seat.status === 'booked') {
        seat.status = 'free';
        for (var i = 0; i < selectedSeats.length; i++) {
            if (selectedSeats[i].row === seat.row && selectedSeats[i].number === seat.number) {
                selectedSeats.splice(i, 1);
                break;
            }
        }
    }

    saveSessions();
    saveSelected();
    drawSeats();
    showCheck();
}

//  Чек 
function showCheck() {
    selectedList.innerHTML = '';

    for (var i = 0; i < selectedSeats.length; i++) {
        var li = document.createElement('li');
        li.textContent = 'Ряд ' + selectedSeats[i].row + ', Место ' + selectedSeats[i].number;
        selectedList.appendChild(li);
    }

    if (selectedSeats.length === 0) {
        emptyText.style.display = 'block';
    } else {
        emptyText.style.display = 'none';
    }

    totalSum.textContent = PRICE * selectedSeats.length;
    checkButton();
}

function checkName() {
    var value = userName.value.trim();
    if (nameRegex.test(value)) {
        userName.className = 'valid';
        nameError.textContent = '';
        return true;
    } else {
        userName.className = 'invalid';
        nameError.textContent = 'Только буквы, от 2 до 30 символов';
        return false;
    }
}

function checkPhone() {
    var value = userPhone.value.replace(/[\s\-()]/g, '');
    if (phoneRegex.test(value)) {
        userPhone.className = 'valid';
        phoneError.textContent = '';
        return true;
    } else {
        userPhone.className = 'invalid';
        phoneError.textContent = 'Формат: +7XXXXXXXXXX или 8XXXXXXXXXX';
        return false;
    }
}

function checkButton() {
    var nameOk = nameRegex.test(userName.value.trim());
    var phoneOk = phoneRegex.test(userPhone.value.replace(/[\s\-()]/g, ''));

    if (nameOk && phoneOk && selectedSeats.length > 0) {
        bookBtn.disabled = false;
    } else {
        bookBtn.disabled = true;
    }
}

userName.addEventListener('input', function () {
    checkName();
    checkButton();
});

userPhone.addEventListener('input', function () {
    checkPhone();
    checkButton();
});

bookForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!checkName() || !checkPhone() || selectedSeats.length === 0) {
        return;
    }

    var session = getCurrentSession();
    for (var i = 0; i < session.seats.length; i++) {
        if (session.seats[i].status === 'booked') {
            session.seats[i].status = 'occupied';
        }
    }

    var count = selectedSeats.length;
    var sum = PRICE * count;

    alert('Спасибо, ' + userName.value.trim() + '! Вы забронировали мест: ' + count + '. Сумма: ' + sum + ' руб.');

    selectedSeats = [];
    saveSessions();
    saveSelected();

    bookForm.reset();
    userName.className = '';
    userPhone.className = '';
    nameError.textContent = '';
    phoneError.textContent = '';

    drawSeats();
    showCheck();
});

//  Смена сеанса 
sessionSelect.addEventListener('change', function () {
    var oldSession = getCurrentSession();
    for (var i = 0; i < oldSession.seats.length; i++) {
        if (oldSession.seats[i].status === 'booked') {
            oldSession.seats[i].status = 'free';
        }
    }
    selectedSeats = [];
    saveSelected();
    saveSessions();

    currentSessionId = Number(sessionSelect.value);
    sessionStorage.setItem('sessionId', currentSessionId);

    showHeader();
    drawSeats();
    showCheck();
});

//  Запуск 
fillSelect();
showHeader();
drawSeats();
showCheck();