(() => {
    const STORAGE_KEY = 'nexus_announcements';
    const list = document.getElementById('announcement-list');
    if (!list) return;

    const form = document.getElementById('announcement-form');
    const status = document.getElementById('announcement-status');
    const isAdmin = list.dataset.admin === 'true';

    function loadAnnouncements() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(saved)
                ? saved.filter((item) => item && typeof item.title === 'string' && typeof item.message === 'string')
                : [];
        } catch {
            return [];
        }
    }

    function renderAnnouncements() {
        const announcements = loadAnnouncements().sort((first, second) =>
            new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
        );
        list.replaceChildren();

        if (announcements.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'announcement-empty';
            emptyMessage.textContent = 'There are no announcements yet.';
            list.appendChild(emptyMessage);
            return;
        }

        announcements.forEach((announcement) => {
            const card = document.createElement('article');
            card.className = 'announcement-card';

            const heading = document.createElement('h3');
            heading.textContent = announcement.title;
            card.appendChild(heading);

            const date = document.createElement('time');
            date.className = 'announcement-date';
            if (announcement.createdAt) {
                date.dateTime = announcement.createdAt;
                const parsedDate = new Date(announcement.createdAt);
                date.textContent = Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleString();
            }
            card.appendChild(date);

            const message = document.createElement('p');
            message.className = 'announcement-message';
            message.textContent = announcement.message;
            card.appendChild(message);

            if (isAdmin) {
                const removeButton = document.createElement('button');
                removeButton.className = 'announcement-delete';
                removeButton.type = 'button';
                removeButton.setAttribute('aria-label', `Delete announcement: ${announcement.title}`);
                removeButton.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
                removeButton.addEventListener('click', () => {
                    const remaining = loadAnnouncements().filter((item) => item.id !== announcement.id);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
                    renderAnnouncements();
                });
                card.appendChild(removeButton);
            }

            list.appendChild(card);
        });
    }

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = form.elements.title.value.trim();
            const message = form.elements.message.value.trim();
            if (!title || !message) return;

            const announcement = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title,
                message,
                createdAt: new Date().toISOString()
            };

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([announcement, ...loadAnnouncements()]));
                form.reset();
                status.textContent = 'Announcement published successfully.';
                renderAnnouncements();
            } catch {
                status.textContent = 'Could not save the announcement in this browser.';
            }
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) renderAnnouncements();
    });

    renderAnnouncements();
})();