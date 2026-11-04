// ================= Application Forms JS =================

// ---- Collapsible helper box ----
document.addEventListener('DOMContentLoaded', function () {
    var helperToggles = document.querySelectorAll('.helper-toggle');
    helperToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var box = toggle.closest('.helper-box');
            if (box) {
                box.classList.toggle('open');
            }
        });
    });

    // ---- Discord ID real-time validation ----
    var discordIdInputs = document.querySelectorAll('.discord-id-input');
    discordIdInputs.forEach(function (input) {
        // Strip non-numeric characters on input
        input.addEventListener('input', function () {
            // Remove anything that's not a digit
            var cleaned = input.value.replace(/[^0-9]/g, '');
            if (cleaned !== input.value) {
                input.value = cleaned;
            }
            validateDiscordId(input);
        });

        // Also validate on blur
        input.addEventListener('blur', function () {
            validateDiscordId(input);
        });
    });

    // ---- Character counters ----
    var textareas = document.querySelectorAll('textarea[data-min-length]');
    textareas.forEach(function (textarea) {
        var minLength = parseInt(textarea.getAttribute('data-min-length'), 10);
        var counter = document.querySelector('[data-counter-for="' + textarea.id + '"]');
        if (!counter) return;

        function updateCounter() {
            var len = textarea.value.trim().length;
            counter.textContent = len + ' / ' + minLength + ' min';
            if (len >= minLength) {
                counter.classList.add('sufficient');
                counter.classList.remove('insufficient');
            } else {
                counter.classList.add('insufficient');
                counter.classList.remove('sufficient');
            }
        }
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });

    // ---- Form submission ----
    var forms = document.querySelectorAll('.application-form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            handleFormSubmit(form);
        });
    });
});

// ---- Discord ID validation ----
function validateDiscordId(input) {
    var wrapper = input.closest('.discord-id-wrapper');
    var errorEl = document.getElementById(input.id + '-error');
    var value = input.value.trim();
    var pattern = /^[0-9]{17,19}$/;
    var isValid = pattern.test(value);

    if (wrapper) {
        if (value.length === 0) {
            wrapper.classList.remove('valid', 'invalid');
        } else if (isValid) {
            wrapper.classList.add('valid');
            wrapper.classList.remove('invalid');
        } else {
            wrapper.classList.add('invalid');
            wrapper.classList.remove('valid');
        }
    }

    if (errorEl) {
        if (value.length > 0 && !isValid) {
            errorEl.classList.add('visible');
        } else {
            errorEl.classList.remove('visible');
        }
    }

    // Also handle form-group error class
    var formGroup = input.closest('.form-group');
    if (formGroup) {
        if (value.length > 0 && !isValid) {
            formGroup.classList.add('has-error');
        } else {
            formGroup.classList.remove('has-error');
        }
    }

    return isValid;
}

// ---- Form submission handler ----
function handleFormSubmit(form) {
    var errorBanner = form.querySelector('.form-error-banner');
    if (errorBanner) {
        errorBanner.classList.remove('visible');
    }

    var isValid = true;
    var firstErrorField = null;

    // Validate all required fields
    var requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function (field) {
        var fieldGroup = field.closest('.form-group');
        var errorEl = document.getElementById(field.id + '-error');

        // Handle radio buttons
        if (field.type === 'radio') {
            var name = field.name;
            var checked = form.querySelector('input[name="' + name + '"]:checked');
            if (!checked) {
                isValid = false;
                var radioError = document.getElementById(name + '-error');
                if (radioError) {
                    radioError.classList.add('visible');
                }
                if (!firstErrorField) {
                    firstErrorField = form.querySelector('input[name="' + name + '"]');
                }
            } else {
                var radioError2 = document.getElementById(name + '-error');
                if (radioError2) {
                    radioError2.classList.remove('visible');
                }
            }
            return;
        }

        // Handle required checkboxes (single, like rules)
        if (field.type === 'checkbox') {
            if (!field.checked) {
                isValid = false;
                var cbError = document.getElementById(field.id + '-error');
                if (cbError) {
                    cbError.classList.add('visible');
                }
                if (fieldGroup) {
                    fieldGroup.classList.add('has-error');
                }
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            } else {
                var cbError2 = document.getElementById(field.id + '-error');
                if (cbError2) {
                    cbError2.classList.remove('visible');
                }
                if (fieldGroup) {
                    fieldGroup.classList.remove('has-error');
                }
            }
            return;
        }

        // Regular inputs, textareas, selects
        var value = (field.value || '').trim();

        // Discord ID special validation
        if (field.classList.contains('discord-id-input')) {
            if (!validateDiscordId(field) || value.length === 0) {
                isValid = false;
                if (fieldGroup) {
                    fieldGroup.classList.add('has-error');
                }
                if (errorEl && value.length === 0) {
                    errorEl.classList.add('visible');
                }
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            } else {
                if (fieldGroup) {
                    fieldGroup.classList.remove('has-error');
                }
            }
            return;
        }

        // Check min length for textareas
        if (field.tagName === 'TEXTAREA' && field.hasAttribute('data-min-length')) {
            var minLen = parseInt(field.getAttribute('data-min-length'), 10);
            if (value.length < minLen) {
                isValid = false;
                if (fieldGroup) {
                    fieldGroup.classList.add('has-error');
                }
                if (errorEl) {
                    errorEl.classList.add('visible');
                }
                if (!firstErrorField) {
                    firstErrorField = field;
                }
                return;
            } else {
                if (fieldGroup) {
                    fieldGroup.classList.remove('has-error');
                }
                if (errorEl) {
                    errorEl.classList.remove('visible');
                }
            }
        }

        // Check empty
        if (value.length === 0) {
            isValid = false;
            if (fieldGroup) {
                fieldGroup.classList.add('has-error');
            }
            if (errorEl) {
                errorEl.classList.add('visible');
            }
            if (!firstErrorField) {
                firstErrorField = field;
            }
        } else {
            if (fieldGroup) {
                fieldGroup.classList.remove('has-error');
            }
            if (errorEl) {
                errorEl.classList.remove('visible');
            }
        }
    });

    if (!isValid) {
        if (errorBanner) {
            errorBanner.classList.add('visible');
        }
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (firstErrorField.focus) {
                firstErrorField.focus();
            }
        }
        return;
    }

    // Collect form data
    var formData = {};
    var allInputs = form.querySelectorAll('input, textarea, select');
    allInputs.forEach(function (field) {
        if (field.type === 'radio') {
            if (field.checked) {
                formData[field.name] = field.value;
            }
        } else if (field.type === 'checkbox') {
            if (field.name) {
                if (field.checked) {
                    if (formData[field.name]) {
                        if (Array.isArray(formData[field.name])) {
                            formData[field.name].push(field.value);
                        } else {
                            formData[field.name] = [formData[field.name], field.value];
                        }
                    } else {
                        formData[field.name] = field.value === 'on' ? true : field.value;
                    }
                }
            }
        } else {
            if (field.name) {
                formData[field.name] = field.value;
            }
        }
    });

    formData._submittedAt = new Date().toISOString();
    formData._formType = form.getAttribute('data-form-type') || 'application';

    // Save to localStorage
    try {
        var key = formData._formType === 'staff' ? 'nexus_staff_application' : 'nexus_partnership_application';
        var existing = [];
        var stored = localStorage.getItem(key);
        if (stored) {
            existing = JSON.parse(stored);
            if (!Array.isArray(existing)) {
                existing = [existing];
            }
        }
        existing.push(formData);
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }

    // Hide form, show success
    form.style.display = 'none';
    var introBox = document.querySelector('.intro-box');
    if (introBox) {
        introBox.style.display = 'none';
    }
    var helperBox = document.querySelector('.helper-box');
    if (helperBox) {
        helperBox.style.display = 'none';
    }

    var successBox = document.getElementById(form.getAttribute('data-success-box'));
    if (successBox) {
        successBox.classList.add('visible');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
