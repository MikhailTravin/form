function formFieldsInit(options = { viewPass: true }) {
	const formFields = document.querySelectorAll("input[placeholder],textarea[placeholder]");
	if (formFields.length) formFields.forEach((formField => {
		if (!formField.hasAttribute("data-placeholder-nohide")) formField.dataset.placeholder = formField.placeholder;
	}));

	document.body.addEventListener("focusin", function (e) {
		const targetElement = e.target;
		if ("INPUT" !== targetElement.tagName && "TEXTAREA" !== targetElement.tagName) return;

		// Не удаляем ошибку для email при фокусе, чтобы не мешать пользователю
		if (targetElement.id !== "email") {
			formValidate.removeError(targetElement);
		}

		const popupInputs = targetElement.closest(".popup__inputs");
		if (popupInputs) {
			popupInputs.classList.remove("_form-error");
			const errorContainer = popupInputs.nextElementSibling?.classList.contains("form-error")
				? popupInputs.nextElementSibling
				: null;
			if (errorContainer) {
				errorContainer.classList.remove('_active'); // Вместо удаления просто скрываем
			}
		}

		if (targetElement.dataset.placeholder && targetElement.value.trim() === "") {
			targetElement.placeholder = targetElement.dataset.placeholder;
		}

		if (!targetElement.hasAttribute("data-no-focus-classes")) {
			targetElement.classList.add("_form-focus");
			targetElement.parentElement.classList.add("_form-focus");
			if (popupInputs) popupInputs.classList.add("_form-focus");
		}
	});

	document.body.addEventListener("input", (function (e) {
		const targetElement = e.target;
		checkInputFilled(targetElement);

		if (targetElement.id === "number" && targetElement.value.replace(/\D/g, "").length === 16) {
			const dateInput = targetElement.closest(".popup__inputs").querySelector("#date");
			if (dateInput) dateInput.focus();
		}
		else if (targetElement.id === "date" && targetElement.value.replace(/\D/g, "").length === 4) {
			const cvvInput = targetElement.closest(".popup__inputs").querySelector("#cvv");
			if (cvvInput) cvvInput.focus();
		}
		else if (targetElement.id === "cvv" && targetElement.value.replace(/\D/g, "").length === 3) {
			targetElement.blur();
		}

		if (["number", "date", "cvv"].includes(targetElement.id)) {
			const popupInputs = targetElement.closest(".popup__inputs");
			if (popupInputs) {
				const paymentClose = popupInputs.querySelector(".payment-close");
				if (paymentClose) {
					paymentClose.style.display = "flex";
				}
				if (targetElement.value.trim() !== "") {
					targetElement.placeholder = "";
				}
				if (targetElement.id === "number") {
					detectCardTypeAndShowIcon(targetElement, popupInputs);
				}
			}
		}

		if (targetElement.id === "number") {
			const popupInputs = targetElement.closest(".popup__inputs");
			if (popupInputs) {
				checkNumberInputFilled(targetElement, popupInputs);
				const cardNumberMask = popupInputs.querySelector(".card-number-mask");
				if (cardNumberMask) {
					const digitsOnly = targetElement.value.replace(/\D/g, "");
					if (digitsOnly.length === 16) {
						cardNumberMask.style.display = "flex";
						const tValue = cardNumberMask.querySelector(".t-value");
						if (tValue) {
							const lastFourDigits = getLastFourDigits(targetElement.value);
							tValue.textContent = lastFourDigits ? `*${lastFourDigits}` : "";
						}
					} else {
						cardNumberMask.style.display = "none";
					}
				}
			}
		}

		checkFormValidity(targetElement.form);
	}));

	document.body.addEventListener("focusout", (function (e) {
		const targetElement = e.target;
		if ("INPUT" !== targetElement.tagName && "TEXTAREA" !== targetElement.tagName) return;
		checkInputFilled(targetElement);

		if (targetElement.dataset.placeholder && targetElement.value.trim() === "") {
			targetElement.placeholder = targetElement.dataset.placeholder;
		}

		if (!targetElement.hasAttribute("data-no-focus-classes")) {
			targetElement.classList.remove("_form-focus");
			targetElement.parentElement.classList.remove("_form-focus");
			const popupInputs = targetElement.closest(".popup__inputs");
			if (popupInputs) {
				const hasFocusedInputs = Array.from(popupInputs.querySelectorAll("input, textarea"))
					.some(el => el.classList.contains("_form-focus"));
				if (!hasFocusedInputs) {
					popupInputs.classList.remove("_form-focus");
				}
			}
		}

		if (targetElement.id === "number") {
			if (targetElement.value.trim() !== "") {
				formValidate.validateInput(targetElement);
			} else {
				formValidate.removeError(targetElement);
			}
		}
		else if (targetElement.hasAttribute("data-validate")) {
			formValidate.validateInput(targetElement);
		}

		const popupInputs = targetElement.closest(".popup__inputs");
		if (popupInputs) {
			const hasErrors = Array.from(popupInputs.querySelectorAll("input, textarea"))
				.some(el => el.classList.contains("_form-error"));

			if (hasErrors) {
				popupInputs.classList.add("_form-error");
			} else {
				popupInputs.classList.remove("_form-error");
			}
		}

		checkFilledFields(popupInputs);
		checkFormValidity(targetElement.form);
	}));

	document.body.addEventListener("click", function (e) {
		const targetElement = e.target;

		if (targetElement.closest(".t-value")) {
			const tValue = targetElement.closest(".t-value");
			const cardNumberMask = tValue.closest(".card-number-mask");
			const popupInputs = cardNumberMask.closest(".popup__inputs");
			const numberInput = popupInputs.querySelector("#number");

			if (numberInput) {
				cardNumberMask.style.display = "none";
				if (popupInputs) {
					popupInputs.classList.remove("active");
				}
				numberInput.focus();
				const length = numberInput.value.length;
				numberInput.setSelectionRange(length, length);
			}
		}

		if (options.viewPass && targetElement.closest('[class*="__viewpass"]')) {
			let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
			targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
			targetElement.classList.toggle("_viewpass-active");
		}

		if (targetElement.closest(".payment-close")) {
			const paymentClose = targetElement.closest(".payment-close");
			const popupInputs = paymentClose.closest(".popup__inputs");

			if (popupInputs) {
				const numberInput = popupInputs.querySelector("#number");
				const dateInput = popupInputs.querySelector("#date");
				const cvvInput = popupInputs.querySelector("#cvv");

				if (numberInput) {
					numberInput.value = "";
					numberInput.placeholder = numberInput.dataset.placeholder;
				}
				if (dateInput) {
					dateInput.value = "";
					dateInput.placeholder = dateInput.dataset.placeholder;
				}
				if (cvvInput) {
					cvvInput.value = "";
					cvvInput.placeholder = cvvInput.dataset.placeholder;
				}

				paymentClose.style.display = "none";
				const cardNumberMask = popupInputs.querySelector(".card-number-mask");
				if (cardNumberMask) {
					cardNumberMask.style.display = "none";
				}

				const cardIcons = popupInputs.querySelectorAll(".popup__icons img");
				cardIcons.forEach(icon => {
					icon.style.display = "none";
				});

				popupInputs.classList.remove("active");
				popupInputs.classList.remove("_form-error");

				const inputs = popupInputs.querySelectorAll("input, textarea");
				inputs.forEach(input => {
					input.classList.remove("_form-error");
				});

				if (numberInput) {
					numberInput.focus();
				}
			}
		}
	});
}

function checkInputFilled(input) {
	if (input.value.trim() !== "") {
		input.classList.add("filled");
	} else {
		input.classList.remove("filled");
	}
}

function checkNumberInputFilled(input, popupInputs) {
	const maxLength = 16;
	const digitsOnly = input.value.replace(/\D/g, "");

	if (digitsOnly.length === maxLength) {
		popupInputs.classList.add("active");
	} else {
		popupInputs.classList.remove("active");
	}
}

function getLastFourDigits(value) {
	const digitsOnly = value.replace(/\D/g, "");
	return digitsOnly.slice(-4);
}

function checkFilledFields(popupInputs) {
	if (popupInputs) {
		const inputs = Array.from(popupInputs.querySelectorAll("input, textarea"));
		const isFilled = inputs.some(input => input.value.trim() !== "");
		if (isFilled) {
			popupInputs.classList.add("filled");
		} else {
			popupInputs.classList.remove("filled");
		}
	}
}

function checkFormValidity(form) {
	if (!form) return;
	const requiredFields = form.querySelectorAll("[data-required]");
	let allValid = true;
	let errorMessage = null;

	requiredFields.forEach(field => {
		const value = field.value.trim();
		if (field.id === "email" && !document.querySelector(".switch__checkbox")?.checked) {
			return;
		}
		if (field.hasAttribute("data-validate")) {
			if (field.id === "number" && value && !formValidate.isValidCardNumber(value)) {
				if (!field.classList.contains('_form-error')) {
					formValidate.addError(field, false); // false - чтобы избежать рекурсии
				}
				allValid = false;
				if (!errorMessage) errorMessage = field.dataset.error;
			} else if (field.id === "date" && (!value || !formValidate.isValidDate(value))) {
				if (!field.classList.contains('_form-error')) {
					formValidate.addError(field, false);
				}
				allValid = false;
				if (!errorMessage) errorMessage = field.dataset.error;
			} else if (field.id === "cvv" && (!value || !formValidate.isValidCVV(value))) {
				if (!field.classList.contains('_form-error')) {
					formValidate.addError(field, false);
				}
				allValid = false;
				if (!errorMessage) errorMessage = field.dataset.error;
			} else if (field.id === "email") {
				const checkbox = document.querySelector(".switch__checkbox");
				if (checkbox?.checked) {
					if (!value) {
						if (!field.classList.contains('_form-error')) {
							formValidate.addError(field, false);
						}
						allValid = false;
						if (!errorMessage) errorMessage = field.dataset.error;
					} else if (!formValidate.emailTest(field)) {
						if (!field.classList.contains('_form-error')) {
							formValidate.addError(field, false);
						}
						allValid = false;
						if (!errorMessage) errorMessage = "Некорректный E-mail";
					}
				}
			}
		} else if (field.hasAttribute("data-required") && value === "") {
			allValid = false;
			if (!errorMessage) errorMessage = field.dataset.error || "Заполните все обязательные поля";
		}
	});

	// Обработка ошибок для карточных данных
	const cardInputs = form.querySelector(".popup__inputs");
	if (cardInputs) {
		const cardErrorContainer = cardInputs.nextElementSibling?.classList.contains('form-error')
			? cardInputs.nextElementSibling
			: null;

		const hasCardErrors = Array.from(cardInputs.querySelectorAll("input"))
			.some(el => el.classList.contains("_form-error"));

		if (hasCardErrors && cardErrorContainer) {
			const firstErrorField = cardInputs.querySelector("input._form-error");
			if (firstErrorField) {
				cardErrorContainer.textContent = firstErrorField.dataset.error || "Ошибка в форме";
			}
			cardErrorContainer.classList.add('_active');
			cardInputs.classList.add("_form-error");
		} else if (cardErrorContainer) {
			cardErrorContainer.classList.remove('_active');
			cardInputs.classList.remove("_form-error");
		}
	}

	// Обработка ошибок для email
	const emailInputsBlock = form.querySelector(".bottom-popup__inputs .popup__inputs");
	if (emailInputsBlock) {
		const emailErrorContainer = form.querySelector(".bottom-popup__inputs .form-error");
		const emailInput = form.querySelector("#email");
		const hasEmailErrors = emailInput && emailInput.classList.contains("_form-error");

		if (hasEmailErrors && emailErrorContainer) {
			emailErrorContainer.textContent = emailInput.dataset.error || "Ошибка в email";
			emailErrorContainer.classList.add('_active');
			emailInputsBlock.classList.add("_form-error");
		} else if (emailErrorContainer) {
			emailErrorContainer.classList.remove('_active');
			emailInputsBlock.classList.remove("_form-error");
		}
	}

	const submitButton = form.querySelector(".popup__button");
	if (submitButton) {
		submitButton.disabled = !allValid;
	}
}

function detectCardTypeAndShowIcon(input, popupInputs) {
	const cardIcons = popupInputs.querySelectorAll(".popup__icons img");
	const cardNumber = input.value.replace(/\D/g, "");

	cardIcons.forEach(icon => {
		icon.style.display = "none";
	});

	if (/^4/.test(cardNumber)) {
		popupInputs.querySelector(".payment-visa").style.display = "inline-flex";
	} else if (/^5/.test(cardNumber)) {
		popupInputs.querySelector(".payment-mastercard").style.display = "inline-flex";
	} else if (/^6/.test(cardNumber)) {
		popupInputs.querySelector(".payment-maestro").style.display = "inline-flex";
	}
}

let formValidate = {
	getErrors(form) {
		let error = 0;
		let formRequiredItems = form.querySelectorAll("*[data-required]");
		if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
			if ((null !== formRequiredItem.offsetParent || "SELECT" === formRequiredItem.tagName) && !formRequiredItem.disabled) {
				if (formRequiredItem.id === "email" && !document.querySelector(".switch__checkbox")?.checked) {
					return;
				}
				if ("checkbox" === formRequiredItem.type && !formRequiredItem.checked) {
					error += this.validateInput(formRequiredItem);
				} else if (formRequiredItem.value.trim()) {
					error += this.validateInput(formRequiredItem);
				}
			}
		}));
		return error;
	},
	validateInput(formRequiredItem) {
		let error = 0;
		const value = formRequiredItem.value.trim();
		this.removeError(formRequiredItem);
		if (formRequiredItem.id === "number") {
			if (value && !this.isValidCardNumber(value)) {
				this.addError(formRequiredItem);
				error++;
			}
		} else if (formRequiredItem.id === "date") {
			if (!value || !this.isValidDate(value)) {
				this.addError(formRequiredItem);
				error++;
			}
		} else if (formRequiredItem.id === "cvv") {
			if (!value || !this.isValidCVV(value)) {
				this.addError(formRequiredItem);
				error++;
			}
		} else if (formRequiredItem.id === "email") {
			const checkbox = document.querySelector(".switch__checkbox");
			if (checkbox?.checked) {
				if (!value) {
					formRequiredItem.dataset.error = "Для оплаты введите E-mail";
					this.addError(formRequiredItem);
					error++;
				} else if (!this.emailTest(formRequiredItem)) {
					formRequiredItem.dataset.error = "Некорректный E-mail";
					this.addError(formRequiredItem);
					error++;
				}
			}
		} else {
			if (!value) {
				this.addError(formRequiredItem);
				error++;
			}
		}
		return error;
	},
	addError(formRequiredItem) {
		formRequiredItem.classList.add('_form-error');
		formRequiredItem.parentElement.classList.add('_form-error');
		const inputsContainer = formRequiredItem.closest('.popup__inputs');
		if (inputsContainer) {
			inputsContainer.classList.add('_form-error');
		}
		checkFormValidity(formRequiredItem.form);
	},
	removeError(formRequiredItem) {
		formRequiredItem.classList.remove('_form-error');
		formRequiredItem.parentElement.classList.remove('_form-error');
		const inputsContainer = formRequiredItem.closest('.popup__inputs');
		if (inputsContainer) {
			inputsContainer.classList.remove('_form-error');
			const errorContainer = inputsContainer.nextElementSibling?.classList.contains('form-error')
				? inputsContainer.nextElementSibling
				: null;
			if (errorContainer) {
				errorContainer.classList.remove('_active');
			}
		}
		checkFormValidity(formRequiredItem.form);
	},
	ensureErrorContainer(container, errorMessage) {
		const inputsContainer = container.closest('.popup__inputs');
		if (!inputsContainer) return null;

		// Теперь мы не создаём новый div, а используем существующий
		const errorContainer = inputsContainer.querySelector('.form-error');

		if (errorContainer) {
			errorContainer.textContent = errorMessage || 'Ошибка в поле';

			// Добавляем класс _active (анимация показывается)
			errorContainer.classList.add('_active');
		}

		return errorContainer;
	},
	emailTest(formRequiredItem) {
		const value = formRequiredItem.value.trim();
		if (!value) return false;
		const parts = value.split('@');
		if (parts.length !== 2) return false;
		const domainParts = parts[1].split('.');
		if (domainParts.length < 2) return false;
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	},
	isValidCardNumber(value) {
		const cleanValue = value.replace(/\D/g, "");
		return cleanValue.length === 16;
	},
	isValidDate(value) {
		return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value);
	},
	isValidCVV(value) {
		return /^[0-9]{3,4}$/.test(value);
	},
};

function formSubmit(options = {
	validate: true
}) {
	const forms = document.forms;
	if (forms.length) for (const form of forms) {
		form.addEventListener("submit", (function (e) {
			const form = e.target;
			formSubmitAction(form, e);
		}));
		form.addEventListener("reset", (function (e) {
			const form = e.target;
			formValidate.formClean(form);
		}));
	}
	async function formSubmitAction(form, e) {
		const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
		if (0 === error) {
			const ajax = form.hasAttribute("data-ajax");
			if (ajax) {
				e.preventDefault();
				const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
				const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
				const formData = new FormData(form);
				form.classList.add("_sending");
				const response = await fetch(formAction, {
					method: formMethod,
					body: formData
				});
				if (response.ok) {
					let responseResult = await response.json();
					form.classList.remove("_sending");
					formSent(form, responseResult);
				} else {
					alert("Ошибка");
					form.classList.remove("_sending");
				}
			} else if (form.hasAttribute("data-dev")) {
				e.preventDefault();
				formSent(form);
			}
		} else {
			e.preventDefault();
			const formError = form.querySelector("._form-error");
			if (formError && form.hasAttribute("data-goto-error")) gotoBlock(formError, true, 1e3);
		}
	}
	function formSent(form, responseResult = ``) {
		document.dispatchEvent(new CustomEvent("formSent", {
			detail: {
				form
			}
		}));
		setTimeout((() => {
			if (flsModules.popup) {
				const popup = form.dataset.popupMessage;
				popup ? flsModules.popup.open(popup) : null;
			}
		}), 0);
		formValidate.formClean(form);
		formLogging(`Форма отправлена!`);
	}
	function formLogging(message) {
		FLS(`[Формы]: ${message}`);
	}
}
formSubmit();
formFieldsInit({
	viewPass: true
});


document.addEventListener("DOMContentLoaded", () => {
	const checkbox = document.querySelector(".switch__checkbox");
	const emailInputsBlock = document.querySelector(".bottom-popup__inputs .popup__inputs");
	const emailInput = document.querySelector("#email");

	// Исправленный селектор для payment-close
	const emailPaymentClose = document.querySelector(".bottom-popup__inputs .payment-close");

	if (!checkbox || !emailInputsBlock || !emailInput) return;

	function toggleEmailInputs() {
		if (checkbox.checked) {
			emailInputsBlock.classList.remove("hidden");
			emailInputsBlock.setAttribute("data-validate-email", "");

			if (emailInput.value.trim()) {
				emailPaymentClose.style.display = "flex";
			}
		} else {
			emailInputsBlock.classList.add("hidden");
			emailInputsBlock.removeAttribute("data-validate-email");
			formValidate.removeError(emailInput);
			emailPaymentClose.style.display = "none";
		}
	}

	// Общий обработчик ввода для email
	emailInput.addEventListener("input", function () {
		const value = this.value.trim();

		// Управляем видимостью payment-close
		if (value) {
			emailPaymentClose.style.display = "flex";
		} else {
			emailPaymentClose.style.display = "none";
		}

		// Валидация
		if (checkbox.checked) {
			if (value === "") {
				this.dataset.error = "Для оплаты введите E-mail";
				formValidate.addError(this);
			} else if (!formValidate.emailTest(this)) {
				this.dataset.error = "Некорректный E-mail";
				formValidate.addError(this);
			} else {
				formValidate.removeError(this);
			}
			checkFormValidity(this.form);
		}
	});

	emailInput.addEventListener("focus", function () {
		// Добавляем классы только при реальном фокусе на поле
		this.classList.add("_form-focus");
		this.parentElement.classList.add("_form-focus");
		emailInputsBlock.classList.add("_form-focus");
	});

	emailInput.addEventListener("blur", function () {
		// Убираем классы при потере фокуса
		this.classList.remove("_form-focus");
		this.parentElement.classList.remove("_form-focus");
		emailInputsBlock.classList.remove("_form-focus");
	});

	// Обработчик клика на payment-close
	if (emailPaymentClose) {
		emailPaymentClose.addEventListener("click", function (e) {
			e.preventDefault();
			emailInput.value = "";
			emailInput.placeholder = emailInput.dataset.placeholder || "";
			this.style.display = "none";
			formValidate.removeError(emailInput);

			if (checkbox.checked) {
				emailInput.dataset.error = "Для оплаты введите E-mail";
				formValidate.addError(emailInput);
			}

			checkFormValidity(emailInput.form);
			emailInput.focus();
		});
	}

	checkbox.addEventListener("change", function () {
		toggleEmailInputs();
		if (this.checked) {
			// Только фокусируем поле, но не добавляем классы
			emailInput.focus();

			// Добавляем ошибку если поле пустое (но без классов фокуса)
			if (!emailInput.value.trim()) {
				emailInput.dataset.error = "Для оплаты введите E-mail";
				formValidate.addError(emailInput);
			}
		} else {
			emailInput.value = "";
			emailPaymentClose.style.display = "none";
			formValidate.removeError(emailInput);
		}
		checkFormValidity(emailInput.form);
	});

	// Инициализация при загрузке
	toggleEmailInputs();
});



//========================================================================================================================================================

//Маска

// Функция для инициализации маски с сохранением ввода
function initializeInputMask(elements, mask, options = {}) {
	if (elements) {
		// Инициализация маски
		Inputmask({
			mask: mask,
			placeholder: "", // Убираем плейсхолдер (например, подчеркивания)
			showMaskOnHover: false,
			showMaskOnFocus: false,
			clearIncomplete: false, // Не очищать неполные значения
			autoUnmask: true, // Возвращает "чистые" данные (без маски)
			onBeforePaste: (pastedValue) => {
				// Очищаем вставленное значение от лишних символов
				return pastedValue.replace(/\D/g, '');
			}
		}).mask(elements);

		// Обработка событий
		elements.forEach((field) => {
			// При фокусе - ничего не делаем (значение не сбрасывается)
			field.addEventListener("focus", function () {
				this.classList.add("_focused");
			});

			// При потере фокуса - проверяем валидность
			field.addEventListener("blur", function () {
				this.classList.remove("_focused");

				// Если поле пустое или не заполнено по маске - добавляем ошибку
				if (!this.value || !this.inputmask.isComplete()) {
					this.classList.add("_form-error");
				} else {
					this.classList.remove("_form-error");
				}
			});

			// При вводе - убираем ошибку и корректируем дату
			field.addEventListener("input", function () {
				if (this.inputmask.isComplete()) {
					this.classList.remove("_form-error");
				}

				// Дополнительная логика для даты
				if (options.correctDate && this.inputmask.mask === "99/99") {
					let unmaskedValue = this.inputmask.unmaskedvalue(); // Получаем "чистое" значение без маски
					let [month, year] = unmaskedValue.split("").map(Number);

					// Корректировка месяца
					if (isNaN(month) || month > 12 || month < 1) {
						month = 1; // Если месяц больше 12 или меньше 1, устанавливаем 01
					}
					month = String(month).padStart(2, "0"); // Добавляем ведущий ноль

					// Корректировка года
					const currentYear = new Date().getFullYear() % 100; // Текущий год (последние две цифры)
					if (isNaN(year) || year < currentYear || year > 99) {
						year = currentYear; // Если год меньше текущего или больше 99, устанавливаем текущий год
					}
					year = String(year).padStart(2, "0"); // Добавляем ведущий ноль

					// Обновляем значение через Inputmask
					this.inputmask.setValue(`${month}/${year}`);
				}
			});
		});
	}
}



// Инициализация масок
const numberCard = document.querySelectorAll(".number-card");
const date = document.querySelectorAll(".date");
const cvv = document.querySelectorAll(".cvv");

initializeInputMask(numberCard, "9999 9999 9999 9999"); // Номер карты
initializeInputMask(date, "99/99", { correctDate: true }); // Дата (MM/YY) с корректировкой
initializeInputMask(cvv, "999"); // CVV

function initializeDateInput(input) {
	input.addEventListener('input', function (e) {
		// Получаем текущее значение без слеша
		let value = this.value.replace(/\D/g, '');

		// Ограничиваем длину до 4 цифр
		if (value.length > 4) {
			value = value.substring(0, 4);
		}

		// Если введено 2 цифры (месяц)
		if (value.length >= 2) {
			let month = value.substring(0, 2);
			let monthNum = parseInt(month, 10);

			// Корректируем месяц
			if (monthNum > 12) {
				// Если больше 12, заменяем первую цифру на 0
				month = '0' + month[1];
			} else if (monthNum === 0) {
				// Если 00, заменяем на 01
				month = '01';
			}

			// Обновляем значение
			value = month + value.substring(2);
		}

		// Форматируем с слешем после 2 цифр
		let formattedValue = value;
		if (value.length > 2) {
			formattedValue = value.substring(0, 2) + '/' + value.substring(2);
		}

		// Устанавливаем новое значение
		this.value = formattedValue;

		// Автопереход к следующему полю при полном вводе
		if (value.length === 4) {
			const nextInput = this.closest('.popup__inputs').querySelector('#cvv');
			if (nextInput) nextInput.focus();
		}
	});

	// Обработка Backspace для возврата к номеру карты
	input.addEventListener('keydown', function (e) {
		if (e.key === 'Backspace' && this.selectionStart === 0) {
			const prevInput = this.closest('.popup__inputs').querySelector('#number');
			if (prevInput) prevInput.focus();
		}
	});
}

// Инициализация для всех полей даты
document.querySelectorAll('#date').forEach(input => {
	initializeDateInput(input);
});