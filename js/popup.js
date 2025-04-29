class Popup {
    constructor(options) {
        let config = {
            logging: true,
            init: true,
            attributeOpenButton: "data-popup",
            attributeCloseButton: "data-close",
            fixElementSelector: "[data-lp]",
            youtubeAttribute: "data-popup-youtube",
            youtubePlaceAttribute: "data-popup-youtube-place",
            setAutoplayYoutube: true,
            classes: {
                popup: "popup",
                popupContent: "popup__content",
                popupActive: "popup_show",
                bodyActive: "popup-show"
            },
            focusCatch: true,
            closeEsc: true,
            bodyLock: true,
            hashSettings: {
                goHash: true
            },
            on: {
                beforeOpen: function () { },
                afterOpen: function () { },
                beforeClose: function () { },
                afterClose: function () { }
            }
        };
        this.youTubeCode;
        this.isOpen = false;
        this.targetOpen = {
            selector: false,
            element: false
        };
        this.previousOpen = {
            selector: false,
            element: false
        };
        this.lastClosed = {
            selector: false,
            element: false
        };
        this._dataValue = false;
        this.hash = false;
        this._reopen = false;
        this._selectorOpen = false;
        this.lastFocusEl = false;
        this._focusEl = ["a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])'];
        this.options = {
            ...config,
            ...options,
            classes: {
                ...config.classes,
                ...options?.classes
            },
            hashSettings: {
                ...config.hashSettings,
                ...options?.hashSettings
            },
            on: {
                ...config.on,
                ...options?.on
            }
        };
        this.bodyLock = false;
        this.options.init ? this.initPopups() : null;
    }

    initPopups() {
        this.eventsPopup();
    }

    eventsPopup() {
        document.body.addEventListener("click", function (e) {
            const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}], [${this.options.attributeOpenButton}*="="]`);
            if (buttonOpen) {
                e.preventDefault();
                this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                if ("error" !== this._dataValue) {
                    if (!this.isOpen) this.lastFocusEl = buttonOpen;
                    this.targetOpen.selector = `${this._dataValue}`;
                    this._selectorOpen = true;
                    this.open();
                    return;
                }
                return;
            }

            const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
            if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                e.preventDefault();
                this.close();
                return;
            }
        }.bind(this));

        document.addEventListener("keydown", function (e) {
            if (this.options.closeEsc && 27 == e.which && "Escape" === e.code && this.isOpen) {
                e.preventDefault();
                this.close();
                return;
            }
            if (this.options.focusCatch && 9 == e.which && this.isOpen) {
                this._focusCatch(e);
                return;
            }
        }.bind(this));

        if (this.options.hashSettings.goHash) {
            window.addEventListener("hashchange", function () {
                if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
            }.bind(this));
            window.addEventListener("load", function () {
                if (window.location.hash) this._openToHash();
            }.bind(this));
        }
    }

    open(selectorValue) {
        if (bodyLockStatus) {
            this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
            if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) {
                this.targetOpen.selector = selectorValue;
                this._selectorOpen = true;
            }
            if (this.isOpen) {
                this._reopen = true;
                this.close();
            }
            if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
            if (!this._reopen) this.previousActiveElement = document.activeElement;
            this.targetOpen.element = document.querySelector(this.targetOpen.selector);
            if (this.targetOpen.element) {

                // Для всех остальных попапов - обычное открытие
                this._actuallyOpenPopup();
            }
        }
    }

    _actuallyOpenPopup() {
        const isPaymentPopup = this.targetOpen.selector === '#success';
        const animationElement = this.targetOpen.element.querySelector('.popup__animation');
        const bodyElement = this.targetOpen.element.querySelector('.popup__body');

        if (animationElement && bodyElement) {
            animationElement.classList.remove('hidden');
            bodyElement.classList.remove('_active');

            setTimeout(() => {
                animationElement.classList.add('hidden');
                bodyElement.classList.add('_active');
            }, 1000);
        }

        if (isPaymentPopup) {
            const warning = this.targetOpen.element.querySelector('.popup__warning');
            const content = this.targetOpen.element.querySelector('.popup__body-2');

            if (warning && content) {

                setTimeout(() => {
                    // Скрываем предупреждение
                    warning.classList.add('hidden');

                    setTimeout(() => {
                        content.classList.add('_active'); // Активируем плавное появление
                    }, 50);
                }, 2000); // Время показа предупреждения (2 секунды)
            }

            // Добавляем обработчик клика на .warning-close
            const warningCloseBtn = this.targetOpen.element.querySelector('.warning-close');
            if (warningCloseBtn) {
                warningCloseBtn.addEventListener('click', () => {
                    if (warning) {
                        warning.classList.add('hidden'); // Скрываем .popup__warning
                    }
                    if (content) {
                        setTimeout(() => {
                            content.classList.add('_active'); // Плавное появление
                        }, 50);
                    }
                });
            }
        }

        if (this.youTubeCode) {
            const codeVideo = this.youTubeCode;
            const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
            const iframe = document.createElement("iframe");
            iframe.setAttribute("allowfullscreen", "");
            const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
            iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
            iframe.setAttribute("src", urlVideo);
            if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
            }
            this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
        }

        if (this.options.hashSettings.location) {
            this._getHash();
            this._setHash();
        }

        this.options.on.beforeOpen(this);
        document.dispatchEvent(new CustomEvent("beforePopupOpen", {
            detail: {
                popup: this
            }
        }));

        this.targetOpen.element.classList.add(this.options.classes.popupActive);
        document.documentElement.classList.add(this.options.classes.bodyActive);
        if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
        this.targetOpen.element.setAttribute("aria-hidden", "false");
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;
        this._selectorOpen = false;
        this.isOpen = true;

        setTimeout((() => {
            this._focusTrap();
        }), 50);

        this.options.on.afterOpen(this);
        document.dispatchEvent(new CustomEvent("afterPopupOpen", {
            detail: {
                popup: this
            }
        }));
    }

    close(selectorValue) {
        if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) {
            this.previousOpen.selector = selectorValue;
        }
        if (!this.isOpen || !bodyLockStatus) return;

        const animationElement = this.targetOpen.element?.querySelector('.popup__animation');
        const bodyElement = this.targetOpen.element?.querySelector('.popup__body');

        if (animationElement && bodyElement) {
            animationElement.classList.remove('hidden');
            bodyElement.classList.remove('_active');
        }

        this.options.on.beforeClose(this);
        document.dispatchEvent(new CustomEvent("beforePopupClose", {
            detail: {
                popup: this
            }
        }));

        if (this.youTubeCode) {
            if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            }
        }

        this.previousOpen.element.classList.remove(this.options.classes.popupActive);
        this.previousOpen.element.setAttribute("aria-hidden", "true");

        if (!this._reopen) {
            document.documentElement.classList.remove(this.options.classes.bodyActive);
            !this.bodyLock ? bodyUnlock() : null;
            this.isOpen = false;
        }

        document.dispatchEvent(new CustomEvent("afterPopupClose", {
            detail: {
                popup: this
            }
        }));

        setTimeout((() => {
            this._focusTrap();
        }), 50);
    }

    _getHash() {
        if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
    }

    _openToHash() {
        let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
        const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
        if (buttons && classInHash) this.open(classInHash);
    }

    _setHash() {
        history.pushState("", "", this.hash);
    }

    _removeHash() {
        history.pushState("", "", window.location.href.split("#")[0]);
    }

    _focusCatch(e) {
        const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
        const focusArray = Array.prototype.slice.call(focusable);
        const focusedIndex = focusArray.indexOf(document.activeElement);
        if (e.shiftKey && 0 === focusedIndex) {
            focusArray[focusArray.length - 1].focus();
            e.preventDefault();
        }
        if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
            focusArray[0].focus();
            e.preventDefault();
        }
    }

    _focusTrap() {
        const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
        if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
    }
}

// Инициализация попапа
const popupInstance = new Popup({});

// Обработчик для кнопки оплаты в попапе баланса
document.addEventListener("DOMContentLoaded", () => {
    const paymentForm = document.querySelector('#balance form');
    if (!paymentForm) return;
    paymentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const paymentButton = this.querySelector('.popup__button[type="submit"]');
        if (!paymentButton) return;

        // Проверяем валидность формы
        const errorCount = formValidate.getErrors(this);
        if (errorCount > 0) return;

        // Показываем состояние загрузки
        paymentButton.classList.add("_loading");
        const buttonText = paymentButton.querySelector(".button-text");
        const spinner = paymentButton.querySelector(".t-loader");
        if (buttonText) buttonText.style.opacity = "0";
        if (spinner) spinner.style.display = "inline-block";
        paymentButton.disabled = true;

        // ✅ Добавляем таймер и переход к #success
        setTimeout(() => {
            // Закрываем #balance
            popupInstance.close("#balance");

            // Внутри setTimeout после открытия #success
            const successPopup = document.querySelector('#success');
            if (successPopup) {
                successPopup.classList.add('popup_show');
                document.documentElement.classList.add('popup-show')
                successPopup.setAttribute("aria-hidden", "false");

                const retryButton = successPopup.querySelector('.popup__button[data-popup="#balance"]');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        successPopup.classList.remove('popup_show');
                        popupInstance.open("#balance"); // <-- Открываем через ваш класс Popup
                    });
                }
            }

            // ==== ДОБАВЛЯЕМ ЛОГИКУ ПОКАЗА АЛЕРТА И СКРЫТИЯ ЧЕРЕЗ 2 СЕКУНДЫ ====
            const warning = successPopup?.querySelector('.popup__warning');
            const content = successPopup?.querySelector('.popup__body-2');

            if (warning && content) {
                // Исходное состояние
                warning.classList.remove('hidden');
                content.classList.remove('_active');

                // Через 2 секунды скрываем alert и показываем основной контент
                setTimeout(() => {
                    warning.classList.add('hidden');
                    setTimeout(() => {
                        content.classList.add('_active');
                    }, 50); // небольшая задержка для плавности
                }, 2000);
            }

            // Добавляем обработчик кнопки закрытия предупреждения
            const warningCloseBtn = successPopup?.querySelector('.warning-close');
            if (warningCloseBtn && warning && content) {
                warningCloseBtn.addEventListener('click', () => {
                    warning.classList.add('hidden');
                    setTimeout(() => {
                        content.classList.add('_active');
                    }, 50);
                });
            }

            // Восстанавливаем кнопку
            paymentButton.classList.remove("_loading");
            if (buttonText) buttonText.style.opacity = "1";
            if (spinner) spinner.style.display = "none";
            paymentButton.disabled = false;
        }, 2000);
    });
});