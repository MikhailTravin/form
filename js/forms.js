
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