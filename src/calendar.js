(() => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const state = {
        events: [],
        years: [],
        activeYear: null,
        activeMonthIndex: 0,
        selectedDateKey: null,
        todayDateKey: null
    };

    const parseLocalDateTime = value => {
        if (!value) return null;

        const [dateValue, timeValue = '00:00:00'] = value.split('T');
        const [year, month, day] = dateValue.split('-').map(Number);
        const [hour = 0, minute = 0, second = 0] = timeValue.split(':').map(Number);

        return new Date(year, month - 1, day, hour, minute, second);
    };

    const getDateKey = date => {
        if (!date) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const getEventDateKey = event => getDateKey(parseLocalDateTime(event.start));

    const getPacificTodayParts = () => {
        const now = new Date();

        return new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        }).formatToParts(now).reduce((acc, part) => {
            if (part.type !== 'literal') acc[part.type] = parseInt(part.value, 10);
            return acc;
        }, {});
    };

    const getPacificTodayKey = () => {
        const today = getPacificTodayParts();

        return `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    };

    const formatDateKey = dateKey => {
        const date = parseLocalDateTime(`${dateKey}T00:00:00`);
        if (!date) return '';

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatEventDateParts = event => {
        const start = parseLocalDateTime(event.start);
        const end = parseLocalDateTime(event.end);

        if (!start) {
            return {
                month: '',
                day: '',
                weekday: '',
                time: ''
            };
        }

        const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const day = String(start.getDate());
        const weekday = start.toLocaleDateString('en-US', { weekday: 'short' });

        if (!end) {
            return {
                month,
                day,
                weekday,
                time: ''
            };
        }

        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit'
        };

        const startTime = start.toLocaleTimeString('en-US', timeOptions).replace(':00', '');
        const endTime = end.toLocaleTimeString('en-US', timeOptions).replace(':00', '');

        return {
            month,
            day,
            weekday,
            time: `${startTime} – ${endTime}`
        };
    };

    const formatEventDate = event => {
        const start = parseLocalDateTime(event.start);
        const end = parseLocalDateTime(event.end);

        if (!start) return '';

        const dateText = start.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        if (!end) return dateText;

        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit'
        };

        return `${dateText} · ${start.toLocaleTimeString('en-US', timeOptions)} – ${end.toLocaleTimeString('en-US', timeOptions)}`;
    };


    function getCalendarCategory(categoryId) {
        return (calendarEventCategories || []).find(function (category) {
            return category.id === categoryId;
        }) || {
            id: 'general',
            label: 'Event',
            icon: 'fa-calendar-days',
            badgeClass: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }

    function buildRecurringCalendarEvent(set, date) {
        return {
            id: set.id + '-' + date,
            title: set.title,
            category: set.category,
            start: date + 'T' + set.startTime + ':00',
            end: date + 'T' + set.endTime + ':00',
            timezone: set.timezone,
            summary: set.summary,
            locationName: set.locationName,
            locationAddress: set.locationAddress,
            room: set.room,
            links: set.links || []
        };
    }

    function getCalendarEvents() {
        var recurringEvents = [];

        (calendarRecurringEventSets || []).forEach(function (set) {
            (set.dates || []).forEach(function (date) {
                recurringEvents.push(buildRecurringCalendarEvent(set, date));
            });
        });

        return recurringEvents.concat(calendarSingleEvents || []).sort(function (a, b) {
            return new Date(a.start) - new Date(b.start);
        });
    }

    const calendarEvents = getCalendarEvents();

    const getCategory = categoryId => {
        if (typeof getCalendarCategory === 'function') {
            return getCalendarCategory(categoryId);
        }

        return {
            id: 'general',
            label: 'Event',
            icon: 'fa-calendar-days',
            badgeClass: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    };

    const isPublicEvent = event => event.category !== 'meeting';

    const isPastEvent = event => {
        const end = parseLocalDateTime(event.end || event.start);
        if (!end) return false;

        return end < new Date();
    };

    const getEventsForYear = year => state.events.filter(event => {
        const start = parseLocalDateTime(event.start);
        return start && start.getFullYear() === year;
    });

    const getPublicEventsForYear = year => getEventsForYear(year).filter(isPublicEvent);

    const getUpcomingPublicEventsForYear = year => {
        const todayKey = getPacificTodayKey();
        const pacificYear = getPacificTodayParts().year;

        return getPublicEventsForYear(year).filter(event => {
            if (year === pacificYear) return getEventDateKey(event) >= todayKey;
            return true;
        });
    };

    const getEventsForDate = (year, monthIndex, day) => state.events.filter(event => {
        const start = parseLocalDateTime(event.start);

        return start &&
            start.getFullYear() === year &&
            start.getMonth() === monthIndex &&
            start.getDate() === day;
    }).sort((a, b) => parseLocalDateTime(a.start) - parseLocalDateTime(b.start));

    const getPublicEventsForDateKey = dateKey => state.events
        .filter(event => isPublicEvent(event) && getEventDateKey(event) === dateKey)
        .sort((a, b) => parseLocalDateTime(a.start) - parseLocalDateTime(b.start));

    const getVisiblePublicEvents = () => {
        if (state.selectedDateKey) {
            return getPublicEventsForDateKey(state.selectedDateKey);
        }

        return getUpcomingPublicEventsForYear(state.activeYear);
    };

    const buildYears = () => {
        const years = new Set();

        state.events.forEach(event => {
            const start = parseLocalDateTime(event.start);
            if (start) years.add(start.getFullYear());
        });

        state.years = [...years].sort((a, b) => a - b);

        if (!state.years.length) {
            state.years = [new Date().getFullYear()];
        }
    };

    const setDefaultYearAndMonth = () => {
        const pacific = getPacificTodayParts();
        const currentYear = pacific.year;
        const currentMonthIndex = pacific.month - 1;

        state.activeYear = state.years.includes(currentYear)
            ? currentYear
            : state.years[0];

        state.activeMonthIndex = state.activeYear === currentYear
            ? currentMonthIndex
            : 0;
    };

    const createYearSelect = () => {
        const select = document.createElement('select');
        select.id = 'calendar-year-select';
        select.className = 'calendar-year-select calendar-year-select-inline';
        select.setAttribute('aria-label', 'Select calendar year');

        state.years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            option.selected = year === state.activeYear;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            state.activeYear = parseInt(select.value, 10);
            state.selectedDateKey = null;

            const pacific = getPacificTodayParts();
            state.activeMonthIndex = state.activeYear === pacific.year ? pacific.month - 1 : 0;

            renderCalendarPage();
        });

        return select;
    };

    const createMonthNavigation = () => {
        const nav = document.createElement('div');
        nav.className = 'calendar-month-nav';

        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'calendar-month-button';
        prev.id = 'calendar-prev-month';
        prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i><span>Previous</span>';
        prev.addEventListener('click', () => goToMonth(state.activeMonthIndex - 1));

        const center = document.createElement('div');
        center.className = 'calendar-month-center calendar-month-center-inline';

        const label = document.createElement('div');
        label.className = 'calendar-month-label';
        label.id = 'calendar-current-month-label';

        center.append(label, createYearSelect());

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'calendar-month-button';
        next.id = 'calendar-next-month';
        next.innerHTML = '<span>Next</span><i class="fa-solid fa-chevron-right"></i>';
        next.addEventListener('click', () => goToMonth(state.activeMonthIndex + 1));

        nav.append(prev, center, next);
        return nav;
    };

    const goToMonth = monthIndex => {
        const currentYearIndex = state.years.indexOf(state.activeYear);

        if (monthIndex < 0) {
            if (currentYearIndex > 0) {
                state.activeYear = state.years[currentYearIndex - 1];
                state.activeMonthIndex = 11;
            } else {
                state.activeMonthIndex = 0;
            }
        } else if (monthIndex > 11) {
            if (currentYearIndex < state.years.length - 1) {
                state.activeYear = state.years[currentYearIndex + 1];
                state.activeMonthIndex = 0;
            } else {
                state.activeMonthIndex = 11;
            }
        } else {
            state.activeMonthIndex = monthIndex;
        }

        state.selectedDateKey = null;

        renderCalendarGrid();
        renderEventList();
    };

    const updateMonthControls = () => {
        const prev = document.getElementById('calendar-prev-month');
        const next = document.getElementById('calendar-next-month');
        const label = document.getElementById('calendar-current-month-label');
        const select = document.getElementById('calendar-year-select');

        const currentYearIndex = state.years.indexOf(state.activeYear);
        const isFirstAvailableMonth = currentYearIndex === 0 && state.activeMonthIndex === 0;
        const isLastAvailableMonth = currentYearIndex === state.years.length - 1 && state.activeMonthIndex === 11;

        if (prev) prev.disabled = isFirstAvailableMonth;
        if (next) next.disabled = isLastAvailableMonth;

        if (label) {
            label.textContent = monthNames[state.activeMonthIndex];
        }

        if (select) {
            select.value = String(state.activeYear);
        }
    };

    const createMonthPanel = (year, monthIndex) => {
        const panel = document.createElement('section');
        panel.className = 'calendar-month-panel';
        panel.setAttribute('aria-label', `${monthNames[monthIndex]} ${year}`);

        const header = document.createElement('div');
        header.className = 'calendar-month-header calendar-month-header-controls';
        header.appendChild(createMonthNavigation());
        panel.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-month-grid';

        dayNames.forEach(dayName => {
            const dayHeading = document.createElement('div');
            dayHeading.className = 'calendar-day-heading';
            dayHeading.textContent = dayName;
            grid.appendChild(dayHeading);
        });

        const firstDay = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day calendar-day-empty';
            grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            grid.appendChild(createDayCell(year, monthIndex, day));
        }

        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

        for (let i = 0; i < remainingCells; i++) {
            const trailingCell = document.createElement('div');
            trailingCell.className = 'calendar-day calendar-day-empty';
            grid.appendChild(trailingCell);
        }

        panel.appendChild(grid);
        return panel;
    };

    const createDayCell = (year, monthIndex, day) => {
        const events = getEventsForDate(year, monthIndex, day);
        const publicEvents = events.filter(isPublicEvent);
        const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const cell = document.createElement('div');
        cell.dataset.dateKey = dateKey;
        cell.className = [
            'calendar-day',
            events.length ? 'calendar-day-has-events' : '',
            publicEvents.length ? 'calendar-day-has-public-events' : '',
            state.todayDateKey === dateKey ? 'calendar-day-today' : '',
            state.selectedDateKey === dateKey ? 'calendar-day-selected' : ''
        ].filter(Boolean).join(' ');

        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        if (publicEvents.length) {
            cell.tabIndex = 0;
            cell.setAttribute('role', 'button');
            cell.setAttribute('aria-label', `Show events for ${formatDateKey(dateKey)}`);

            cell.addEventListener('click', event => {
                event.preventDefault();
                setSelectedDate(dateKey);
            });

            cell.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedDate(dateKey);
                }
            });
        }

        events.forEach(event => {
            const category = getCategory(event.category);
            const chip = document.createElement('button');

            chip.type = 'button';
            chip.className = `calendar-chip ${category.badgeClass}`;
            chip.title = event.title;

            if (isPublicEvent(event)) {
                chip.addEventListener('click', clickEvent => {
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                    setSelectedDate(dateKey);
                });
            } else {
                chip.disabled = true;
                chip.classList.add('calendar-chip-muted');
            }

            const icon = document.createElement('i');
            icon.className = `fa-solid ${category.icon}`;

            const text = document.createElement('span');
            text.textContent = event.title;

            chip.append(icon, text);
            cell.appendChild(chip);
        });

        return cell;
    };

    const createCalendarScroller = () => {
        const viewport = document.createElement('div');
        viewport.className = 'calendar-scroll-viewport';
        viewport.id = 'calendar-scroll-viewport';

        const track = document.createElement('div');
        track.className = 'calendar-scroll-track';

        track.appendChild(createMonthPanel(state.activeYear, state.activeMonthIndex));
        viewport.appendChild(track);

        return viewport;
    };

    const updateSelectedDayStyles = () => {
        document.querySelectorAll('.calendar-day-selected').forEach(cell => {
            cell.classList.remove('calendar-day-selected');
        });

        if (!state.selectedDateKey) return;

        const selectedCell = document.querySelector(`[data-date-key="${state.selectedDateKey}"]`);
        if (selectedCell) selectedCell.classList.add('calendar-day-selected');
    };

    const setSelectedDate = dateKey => {
        state.selectedDateKey = dateKey;
        updateSelectedDayStyles();
        renderEventList();
    };

    const clearSelectedDate = () => {
        state.selectedDateKey = null;
        updateSelectedDayStyles();
        renderEventList();
    };

    const renderCalendarGrid = () => {
        const mount = document.getElementById('calendar-grid');
        if (!mount) return;

        mount.innerHTML = '';
        mount.appendChild(createCalendarScroller());

        updateMonthControls();
    };

    const renderListSummary = events => {
        const summary = document.getElementById('calendar-list-summary');
        if (!summary) return;

        summary.innerHTML = '';

        const text = document.createElement('span');

        if (state.selectedDateKey) {
            text.textContent = events.length
                ? `Events for ${formatDateKey(state.selectedDateKey)}`
                : `No public events are listed for ${formatDateKey(state.selectedDateKey)}.`;

            const clear = document.createElement('button');
            clear.type = 'button';
            clear.className = 'calendar-clear-filter';
            clear.textContent = 'Show all upcoming events';
            clear.addEventListener('click', clearSelectedDate);

            summary.append(text, clear);
            return;
        }

        text.textContent = events.length
            ? 'Upcoming community events and fundraisers'
            : `No upcoming public events are listed for ${state.activeYear}.`;

        summary.appendChild(text);
    };

    const renderEventList = () => {
        const mount = document.getElementById('calendar-list');
        if (!mount) return;

        const events = getVisiblePublicEvents();
        mount.innerHTML = '';
        renderListSummary(events);

        if (!events.length) {
            const empty = document.createElement('p');
            empty.className = 'text-gray-500';
            empty.textContent = state.selectedDateKey
                ? 'Try another highlighted date, or return to the upcoming events list.'
                : 'Check back for upcoming fundraisers, service projects, and community events.';
            mount.appendChild(empty);
            return;
        }

        events.forEach(event => mount.appendChild(createEventCard(event)));
    };

    const createEventCard = event => {
        const category = getCategory(event.category);
        const pastEvent = isPastEvent(event);
        const dateParts = formatEventDateParts(event);

        const card = document.createElement('article');
        card.className = [
            'event-card',
            'event-card-with-date',
            pastEvent ? 'event-card-past' : ''
        ].filter(Boolean).join(' ');
        card.id = `event-${event.id}`;

        const dateRail = document.createElement('div');
        dateRail.className = 'event-date-rail';

        const month = document.createElement('div');
        month.className = 'event-date-rail-month';
        month.textContent = dateParts.month;

        const day = document.createElement('div');
        day.className = 'event-date-rail-day';
        day.textContent = dateParts.day;

        const weekday = document.createElement('div');
        weekday.className = 'event-date-rail-weekday';
        weekday.textContent = dateParts.weekday;

        const time = document.createElement('div');
        time.className = 'event-date-rail-time';
        time.textContent = dateParts.time;

        dateRail.append(month, day, weekday, time);

        const body = document.createElement('div');
        body.className = 'event-card-body';

        const top = document.createElement('div');
        top.className = 'event-card-top';

        const titleWrap = document.createElement('div');

        const title = document.createElement('h3');
        title.className = 'event-title';
        title.textContent = event.title;

        const dateLine = document.createElement('p');
        dateLine.className = 'event-date-line';
        dateLine.textContent = formatEventDate(event);

        titleWrap.append(title, dateLine);

        const badge = document.createElement('span');
        badge.className = `calendar-category-badge ${category.badgeClass}`;
        badge.innerHTML = `<i class="fa-solid ${category.icon}"></i>${category.label}`;

        top.append(titleWrap, badge);
        body.appendChild(top);

        if (pastEvent) {
            const pastNotice = document.createElement('p');
            pastNotice.className = 'event-past-notice';
            pastNotice.textContent = 'This event has already passed.';
            body.appendChild(pastNotice);
        }

        if (event.summary) {
            const summary = document.createElement('p');
            summary.className = 'event-summary';
            summary.textContent = event.summary;
            body.appendChild(summary);
        }

        const details = document.createElement('div');
        details.className = 'event-details-grid';

        if (event.locationName || event.locationAddress) {
            const location = document.createElement('div');
            location.className = 'event-location';

            const locationIcon = document.createElement('i');
            locationIcon.className = 'fa-solid fa-location-dot';

            const locationText = document.createElement('div');

            const locationName = document.createElement('p');
            locationName.className = 'font-bold text-gray-700';
            locationName.textContent = event.locationName || 'Location';

            locationText.appendChild(locationName);

            if (event.locationAddress) {
                const address = document.createElement('p');
                address.textContent = event.locationAddress;
                locationText.appendChild(address);
            }

            location.append(locationIcon, locationText);
            details.appendChild(location);
        }

        if (!pastEvent && event.links?.length) {
            const links = document.createElement('div');
            links.className = 'event-links';

            event.links.forEach(link => {
                if (!link?.href || !link?.label) return;

                const a = document.createElement('a');
                a.href = link.href;
                a.target = '_blank';
                a.rel = 'noopener';
                a.className = 'event-link-button';
                a.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i>${link.label}`;

                links.appendChild(a);
            });

            if (links.children.length) details.appendChild(links);
        }

        if (details.children.length) body.appendChild(details);

        card.append(dateRail, body);

        return card;
    };

    const updateEventCount = () => {
        const eventCount = document.getElementById('event-count');
        if (!eventCount) return;

        const count = getVisiblePublicEvents().length;

        eventCount.textContent = count === 1
            ? `1 public event for ${state.activeYear}`
            : `${count} public events for ${state.activeYear}`;
    };

    const renderCalendarPage = () => {
        updateEventCount();
        renderCalendarGrid();
        renderEventList();
    };

    const initMobileNavClose = () => {
        document.querySelectorAll('.nav-mobile a').forEach(link => {
            link.addEventListener('click', () => {
                const checkbox = document.getElementById('nav-check');
                if (checkbox) checkbox.checked = false;
            });
        });
    };

    const initCalendarPage = () => {
        state.events = typeof calendarEvents !== 'undefined' && Array.isArray(calendarEvents)
            ? [...calendarEvents]
            : [];
        state.todayDateKey = getPacificTodayKey();

        buildYears();
        setDefaultYearAndMonth();
        renderCalendarPage();
        initMobileNavClose();
    };

    document.addEventListener('DOMContentLoaded', initCalendarPage);
})();