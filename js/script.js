let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
    if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
};
let bodyUnlock = (delay = 500) => {
    let body = document.querySelector("body");
    const fixBlocks = document.querySelectorAll(".fix-block");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        setTimeout((() => {
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = "0px";
            }
            body.style.paddingRight = "0px";
            fixBlocks.forEach((el => {
                el.style.paddingRight = "0px";
            }));
            document.documentElement.classList.remove("lock");
        }), delay);
        bodyLockStatus = false;
        setTimeout((function () {
            bodyLockStatus = true;
        }), delay);
    }
};
let bodyLock = (delay = 500) => {
    let body = document.querySelector("body");
    const fixBlocks = document.querySelectorAll(".fix-block");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.body.offsetWidth + "px";
        }
        body.style.paddingRight = window.innerWidth - document.body.offsetWidth + "px";
        fixBlocks.forEach((el => {
            el.style.paddingRight = window.innerWidth - document.body.offsetWidth + "px";
        }));
        document.documentElement.classList.add("lock");
        bodyLockStatus = false;
        setTimeout((function () {
            bodyLockStatus = true;
        }), delay);
    }
};

//========================================================================================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Функция для наблюдения за изменениями стиля card-number-mask
    const observeCardNumberMask = (popupInputsSelector) => {
        const popupInputs = document.querySelector(popupInputsSelector);
        if (!popupInputs) {
            console.error(`Контейнер ${popupInputsSelector} не найден в DOM.`);
            return;
        }
        const cardNumberMask = popupInputs.querySelector('.card-number-mask');
        if (!cardNumberMask) {
            console.error('Элемент .card-number-mask не найден в DOM.');
            return;
        }

        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const displayStyle = window.getComputedStyle(cardNumberMask).display;
                    if (displayStyle === 'flex') {
                        popupInputs.classList.add('active');
                    } else {
                        popupInputs.classList.remove('active');
                    }
                }
            });
        });

        observer.observe(cardNumberMask, { attributes: true });
    };

    // Функция для инициализации логики ввода данных
    const initializeInputLogic = (popupInputsSelector) => {
        const popupInputs = document.querySelector(popupInputsSelector);
        if (!popupInputs) {
            console.error(`Контейнер ${popupInputsSelector} не найден в DOM.`);
            return;
        }

        const cardNumberInput = popupInputs.querySelector('#number');
        const dateInput = popupInputs.querySelector('#date');
        const cvvInput = popupInputs.querySelector('#cvv');
        const emailInput = popupInputs.querySelector('#email');
        const paymentCloseIcon = popupInputs.querySelector('.payment-close');
        const visaIcon = popupInputs.querySelector('.payment-visa');
        const mastercardIcon = popupInputs.querySelector('.payment-mastercard');
        const maestroIcon = popupInputs.querySelector('.payment-maestro');
        const cardNumberMask = popupInputs.querySelector('.card-number-mask');
        const inputs = popupInputs.querySelectorAll('input[data-required]');
        const form = popupInputs.closest('.popup__body');
        const submitButton = form?.querySelector('.popup__button');

        if (!submitButton) {
            console.error('Кнопка "Оплатить" не найдена в DOM.');
            return;
        }

        let errorSpan = null;
        let isMasked = false;

        // Функция для удаления span с ошибкой
        const removeErrorSpan = () => {
            if (errorSpan) {
                errorSpan.classList.remove('active');
                setTimeout(() => {
                    if (errorSpan && errorSpan.parentNode) {
                        errorSpan.remove();
                    }
                    errorSpan = null;
                }, 300);
            }
        };

        // Функция для определения типа карты
        const detectCardType = (cardNumber) => {
            const trimmedNumber = cardNumber.replace(/\s+/g, '');
            if (/^4/.test(trimmedNumber)) return 'visa';
            else if (/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[0-1]))/.test(trimmedNumber)) return 'mastercard';
            else if (/^(5018|5020|5038|56|57|58|60|63|67)/.test(trimmedNumber)) return 'maestro';
            return null;
        };

        // Функция для форматирования номера карты
        const formatCardNumber = (value) => {
            const digitsOnly = value.replace(/\D/g, '');
            const groups = digitsOnly.match(/.{1,4}/g);
            return groups ? groups.join(' ') : '';
        };

        // Функция для проверки заполненности поля
        const isFieldComplete = (input) => {
            if (!input) return false;

            if (input.id === 'email') {
                return validateEmail(input); // Используем специальную проверку для email
            }

            const cleanValue = input.value.replace(/\D/g, '');
            const cleanPlaceholder = input.placeholder?.replace(/\D/g, '') || '';
            return cleanValue.length >= cleanPlaceholder.length;
        };

        // Функция для проверки валидности email
        const validateEmail = (input) => {
            if (!input) return false;

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmpty = input.value.trim() === '';
            const isValid = emailPattern.test(input.value);

            if (isEmpty) {
                popupInputs.classList.add('_form-error');
                if (!errorSpan) {
                    errorSpan = document.createElement('span');
                    errorSpan.className = 'form-error';
                    popupInputs.parentNode.insertBefore(errorSpan, popupInputs.nextSibling);
                }
                errorSpan.textContent = 'Для оплаты введите E-mail';
                setTimeout(() => {
                    errorSpan.classList.add('active');
                }, 10);
                return false;
            } else if (!isValid) {
                popupInputs.classList.add('_form-error');
                if (!errorSpan) {
                    errorSpan = document.createElement('span');
                    errorSpan.className = 'form-error';
                    popupInputs.parentNode.insertBefore(errorSpan, popupInputs.nextSibling);
                }
                errorSpan.textContent = 'Некорректный E-mail';
                setTimeout(() => {
                    errorSpan.classList.add('active');
                }, 10);
                return false;
            } else {
                popupInputs.classList.remove('_form-error');
                removeErrorSpan();
                return true;
            }
        };
        // Основная функция валидации формы
        const validateForm = () => {
            const allFieldsValid = Array.from(inputs).every(input => {
                if (input.id === 'email') {
                    // Проверяем состояние чекбокса
                    const switchCheckbox = document.querySelector('.switch__checkbox');
                    if (!switchCheckbox || !switchCheckbox.checked) {
                        return true; // Игнорируем поле email, если чекбокс не отмечен
                    }
                }
                return isFieldComplete(input);
            });

            const noErrors = !popupInputs.classList.contains('_form-error');
            if (allFieldsValid && noErrors) {
                submitButton.classList.add('active');
                submitButton.disabled = false;
            } else {
                submitButton.classList.remove('active');
                submitButton.disabled = true;
            }
        };

        // Обработчик ввода номера карты
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                const rawValue = cardNumberInput.value.replace(/\s+/g, '');
                cardNumberInput.setAttribute('data-raw-value', rawValue);

                // Показываем иконки платежных систем
                if (rawValue.length > 0) {
                    visaIcon.style.display = 'none';
                    mastercardIcon.style.display = 'none';
                    maestroIcon.style.display = 'none';
                    paymentCloseIcon.style.display = 'flex';

                    const cardType = detectCardType(rawValue);
                    if (cardType === 'visa') visaIcon.style.display = 'block';
                    else if (cardType === 'mastercard') mastercardIcon.style.display = 'block';
                    else if (cardType === 'maestro') maestroIcon.style.display = 'block';
                } else {
                    visaIcon.style.display = 'none';
                    mastercardIcon.style.display = 'none';
                    maestroIcon.style.display = 'none';
                    paymentCloseIcon.style.display = 'none';
                }

                // Обработка маскировки карты
                if (rawValue.length === 16) {
                    const cardType = detectCardType(rawValue);
                    if (cardType) {
                        cardNumberInput.value = `*${rawValue.slice(-4)}`;
                        isMasked = true;
                        if (cardNumberMask) {
                            cardNumberMask.style.display = 'flex';
                            cardNumberMask.querySelector('.t-value').textContent = `*${rawValue.slice(-4)}`;
                        }
                        popupInputs.classList.add('active');
                        document.querySelector('.input_expire')?.classList.add('active');
                        document.querySelector('.input_cvv')?.classList.add('active');
                        dateInput?.focus();
                    } else {
                        cardNumberInput.value = formatCardNumber(rawValue);
                        isMasked = false;
                        if (cardNumberMask) cardNumberMask.style.display = 'none';
                    }
                } else if (rawValue.length < 16) {
                    cardNumberInput.value = formatCardNumber(rawValue);
                    isMasked = false;
                    if (cardNumberMask) cardNumberMask.style.display = 'none';
                }

                validateForm();
            });
        }

        // Обработчики для остальных полей
        if (dateInput) {
            dateInput.addEventListener('input', (e) => {
                validateForm();
                const rawValue = dateInput.value.replace(/\D/g, '');
                if (rawValue.length === 4) cvvInput?.focus(); // Переходим к CVV после даты
            });
        }

        if (cvvInput) {
            cvvInput.addEventListener('input', validateForm); // Перепроверяем форму при изменении CVV
        }

        if (emailInput) {
            emailInput.addEventListener('input', () => {
                validateEmail(emailInput); // Проверяем email
                validateForm(); // Перепроверяем форму
            });
        }

        // Общие обработчики для всех полей
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                popupInputs.classList.add('_form-focus');
                popupInputs.classList.remove('_form-error');
                removeErrorSpan();

                if (input === cardNumberInput && isMasked) {
                    const rawValue = input.getAttribute('data-raw-value');
                    input.value = formatCardNumber(rawValue);
                    isMasked = false;
                    if (cardNumberMask) cardNumberMask.style.display = 'none';
                }
            });

            input.addEventListener('blur', () => {
                if (input === cardNumberInput && isFieldComplete(cardNumberInput)) {
                    const rawValue = input.getAttribute('data-raw-value');
                    input.value = `*${rawValue.slice(-4)}`;
                    isMasked = true;
                    if (cardNumberMask) {
                        cardNumberMask.style.display = 'flex';
                        cardNumberMask.querySelector('.t-value').textContent = `*${rawValue.slice(-4)}`;
                    }
                }
                validateForm();
            });
        });

        // Обработчик очистки формы
        if (paymentCloseIcon) {
            paymentCloseIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (cardNumberInput) {
                    cardNumberInput.value = '';
                    cardNumberInput.setAttribute('data-raw-value', '');
                }
                if (dateInput) dateInput.value = '';
                if (cvvInput) cvvInput.value = '';
                if (emailInput) emailInput.value = '';

                visaIcon.style.display = 'none';
                mastercardIcon.style.display = 'none';
                maestroIcon.style.display = 'none';
                paymentCloseIcon.style.display = 'none';

                isMasked = false;
                if (cardNumberMask) cardNumberMask.style.display = 'none';

                popupInputs.classList.remove('active');
                document.querySelector('.input_expire')?.classList.remove('active');
                document.querySelector('.input_cvv')?.classList.remove('active');
                popupInputs.classList.remove('_form-focus');
                popupInputs.classList.remove('_form-error');
                removeErrorSpan();

                if (cardNumberInput) cardNumberInput.focus();
                validateForm();
            });
        }
    };

    // Инициализация для верхнего блока
    initializeInputLogic('.popup__center .popup__inputs');
    observeCardNumberMask('.popup__center .popup__inputs');

    // Инициализация для нижнего блока
    initializeInputLogic('.popup__bottom .popup__inputs');
    observeCardNumberMask('.popup__bottom .popup__inputs');

    // Логика для переключения видимости bottom-popup
    const switchCheckbox = document.querySelector('.switch__checkbox');
    const bottomPopupInputs = document.querySelector('.popup__bottom .popup__inputs');
    const bottomEmailInput = document.querySelector('.popup__bottom #email');

    if (switchCheckbox && bottomPopupInputs) {
        switchCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                bottomPopupInputs.classList.remove('hidden'); // Показываем поле email
                validateForm(); // Перепроверяем форму
            } else {
                bottomPopupInputs.classList.add('hidden'); // Скрываем поле email
                bottomPopupInputs.classList.remove('_form-error'); // Убираем ошибку
                const errorSpan = bottomPopupInputs.parentNode.querySelector('.form-error');
                if (errorSpan) errorSpan.remove(); // Удаляем сообщение об ошибке
                validateForm(); // Перепроверяем форму
            }
        });
    }
});

//========================================================================================================================================================

